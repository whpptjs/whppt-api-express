import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';
import { findActiveStaff } from '../staff/login';

const refund: HttpModule<
  { orderId: string; refundReason: string; username: string; password: string },
  void
> = {
  exec(context, { orderId, refundReason, username, password }) {
    assert(orderId, 'Order Id not found');
    assert(refundReason, 'A Reason not provided');
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

              return context.$database.then(({ document, startTransaction }) => {
                return document.fetch<Order>('orders', orderId).then(loadedOrder => {
                  assert(loadedOrder, 'Order not found');
                  assert(
                    loadedOrder?.payment?.status === 'paid',
                    'Order not in a paid status'
                  );
                  assert(
                    loadedOrder?.checkoutStatus === 'paid',
                    'Order not in a paid status'
                  );
                  const amount =
                    (loadedOrder?.payment?.subTotal || 0) -
                    (loadedOrder?.payment?.memberTotalDiscount || 0);
                  assign(loadedOrder, {
                    ...loadedOrder,
                    checkoutStatus: 'refunded',
                    payment: {
                      ...loadedOrder.payment,
                      status: 'refunded',
                      refund: {
                        amount,
                        reason: refundReason,
                        by: {
                          username: context.staff.sub.username,
                          _id: context.staff.sub._id,
                        },
                      },
                    },
                  });

                  const events = [
                    context.createEvent('OrderPaymentRefunded', {
                      _id: orderId,
                      refundReason,
                    }),
                  ];

                  return startTransaction(session => {
                    return document.saveWithEvents('orders', loadedOrder, events, {
                      session,
                    });
                  });
                });
              });
            });
        });
      });
    });
  },
};

export default Secure(refund);
