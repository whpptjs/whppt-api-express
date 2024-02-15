import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';
import { findActiveStaff } from '../staff/login';

const stripe = require('stripe')(process.env.STRIPE_KEY);

const refund: HttpModule<
  {
    orderId: string;
    refundReason: string;
    username: string;
    password: string;
    incShipping?: boolean;
  },
  void
> = {
  exec(context, { orderId, refundReason, username, password, incShipping = false }) {
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
                    loadedOrder?.stripe?.status === 'paid',
                    'Order not in a paid status'
                  );
                  var amount =
                    (loadedOrder?.payment?.subTotal || 0) -
                    (loadedOrder?.payment?.memberTotalDiscount || 0);
                  if (incShipping) {
                    amount += Number(loadedOrder?.payment?.shippingCost?.price) || 0;
                  }
                  assign(loadedOrder, {
                    ...loadedOrder,
                    checkoutStatus: 'refunded',
                    stripe: {
                      ...loadedOrder.stripe,
                      status: 'refunded',
                      refund: {
                        reason: refundReason,
                        amount,
                        by: {
                          username: context.staff.sub.username,
                          _id: context.staff.sub._id,
                        },
                      },
                    },
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
                    context.createEvent('OrderPaymentRefundedThroughStripe', {
                      _id: orderId,
                      refundReason,
                    }),
                    context.createEvent('OrderPaymentRefunded', {
                      _id: orderId,
                      refundReason,
                    }),
                  ];

                  return startTransaction(session => {
                    return stripe.refunds
                      .create({
                        payment_intent: loadedOrder?.stripe?.intentId,
                        amount: Math.round(amount),
                      })
                      .then(() => {
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
    });
  },
};

export default Secure(refund);
