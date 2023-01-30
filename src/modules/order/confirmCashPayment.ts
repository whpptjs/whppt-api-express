import { assign, omit } from 'lodash';
import { HttpModule } from '../HttpModule';
import assert from 'assert';
import { findActiveStaff } from '../staff/login';
import { Secure } from '../staff/Secure';
import * as validations from './Validations';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { Order, OrderItemWithProduct } from './Models/Order';

const confirmCashPayment: HttpModule<
  { username: string; password: string; orderId: string },
  any
> = {
  exec(context, { username, password, orderId }) {
    //{ context.$database, context.$security, createEvent }
    assert(orderId, 'An Order id is required');
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    return context.$database.then(db => {
      return findActiveStaff(db, username).then(staffMember => {
        return context.$security.encrypt(password).then(() => {
          return context.$security
            .compare(password, staffMember?.password || '')
            .then(passwordMatches => {
              if (!passwordMatches)
                return Promise.reject(
                  new Error("The password that you've entered is incorrect.")
                );

              const { document, startTransaction } = db;

              return document.fetch<Order>('orders', orderId).then(loadedOrder => {
                return loadOrderWithProducts(context, { _id: orderId }).then(
                  orderWithProducts => {
                    assert(loadedOrder, 'Order not found');
                    validations.canBeModified(loadedOrder);

                    assign(loadedOrder, {
                      ...loadedOrder,
                      checkoutStatus: 'paid',
                      items: orderWithProducts.items.map((item: OrderItemWithProduct) => {
                        return omit(
                          { ...item, purchasedPrice: item.product?.price },
                          'product'
                        );
                      }),
                    });

                    const events = [
                      context.createEvent('OrderCashPaymentConfirmed', {
                        _id: orderId,
                        staffMember,
                      }),
                      context.createEvent('ProductsConfirmedToOrder', {
                        _id: orderId,
                        items: loadedOrder.items,
                      }),
                    ];

                    return startTransaction((session: any) => {
                      return document.saveWithEvents('orders', loadedOrder, events, {
                        session,
                      });
                    });
                  }
                );
              });
            });
        });
      });
    });
  },
};

export default Secure(confirmCashPayment);
