import { assign, omit } from 'lodash';
import { HttpModule } from '../HttpModule';
import assert from 'assert';
import { Secure } from '../staff/Secure';
import * as validations from './Validations';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { Order, OrderItemWithProduct } from './Models/Order';
import { calculateTotal } from '../../modules/order/Queries/calculateTotal';

const confirmCashPayment: HttpModule<
  { staffMemberId: string; orderId: string; domainId: string },
  any
> = {
  exec(context, { staffMemberId, orderId, domainId }) {
    assert(orderId, 'An Order id is required');
    assert(domainId, 'Domain Id is required.');
    assert(staffMemberId, 'Staff member ID is required');

    return context.$database.then(db => {
      const { document, startTransaction } = db;

      return document.fetch<Order>('orders', orderId).then(loadedOrder => {
        return calculateTotal(context, {
          orderId,
          domainId,
          memberId: loadedOrder.memberId,
        }).then(
          ({
            shippingCost,
            total,
            subTotal,
            memberTotalDiscount,
            memberShippingDiscount,
            originalTotal,
            originalSubTotal,
            overrideTotalPrice,
            discountApplied,
          }) => {
            return loadOrderWithProducts(context, { _id: orderId }).then(
              orderWithProducts => {
                assert(loadedOrder, 'Order not found');
                validations.canBeModified(loadedOrder);

                assign(loadedOrder, {
                  ...loadedOrder,
                  checkoutStatus: 'paid',
                  items: orderWithProducts.items.map((item: OrderItemWithProduct) => {
                    return omit(
                      {
                        ...item,
                        purchasedPrice: item.overidedPrice || item.product?.price,
                        originalPrice: item.product?.price,
                      },
                      'product'
                    );
                  }),
                  payment: {
                    status: 'paid',
                    type: 'cash',
                    date: new Date(),
                    amount: total,
                    subTotal,
                    memberTotalDiscount,
                    memberShippingDiscount,
                    shippingCost,
                    originalTotal,
                    originalSubTotal,
                    overrideTotalPrice,
                    discountApplied,
                  },
                });

                const events = [
                  context.createEvent('OrderCashPaymentConfirmed', {
                    _id: orderId,
                    staffMemberId: staffMemberId,
                    amount: total,
                    subTotal,
                    memberTotalDiscount,
                    memberShippingDiscount,
                    shippingCost,
                    originalTotal,
                    originalSubTotal,
                    overrideTotalPrice,
                    discountApplied,
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
          }
        );
      });
    });
  },
};

export default Secure(confirmCashPayment);
