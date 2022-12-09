import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';

const stripe = require('stripe')(process.env.STRIPE_KEY);

const refund: HttpModule<{ orderId: string; refundReason: string }, void> = {
  exec(context, { orderId, refundReason }) {
    assert(orderId, 'Order Id not found');
    assert(refundReason, 'A Reason not provided');
    return context.$database.then(({ document, startTransaction }) => {
      return document.fetch<Order>('orders', orderId).then(loadedOrder => {
        assert(loadedOrder, 'Order not found');
        assert(loadedOrder?.stripe?.status === 'paid', 'Order not in a paid status');

        assign(loadedOrder, {
          ...loadedOrder,
          checkoutStatus: 'refunded',
          stripe: {
            ...loadedOrder.stripe,
            status: 'refunded',
            refund: {
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
          }),
        ];

        return startTransaction(session => {
          return stripe.refunds
            .create({
              payment_intent: loadedOrder?.stripe?.intentId,
              amount: loadedOrder?.stripe?.amount,
            })
            .then(() => {
              return document.saveWithEvents('orders', loadedOrder, events, {
                session,
              });
            });
        });
      });
    });
  },
};

export default Secure(refund);
