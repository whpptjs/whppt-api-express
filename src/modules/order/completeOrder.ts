import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';

const completeOrder: HttpModule<{ orderId: string; paymentIntent: string }, void> = {
  exec({ $database, createEvent }, { orderId, paymentIntent }) {
    assert(orderId, 'Order Id not found');
    assert(paymentIntent, 'Payment Intent not provided');
    return $database
      .then(({ document, startTransaction }) => {
        return document.fetch('orders', orderId).then(loadedOrder => {
          assert(loadedOrder, 'Order not found');
          assert(loadedOrder.orderStatus, 'Order already completed.');

          assign(loadedOrder, {
            ...loadedOrder,
            payment: {
              _id: paymentIntent,
            },
            orderStatus: 'completed',
          });

          const events = [
            createEvent('OrderPaymentProcessedThroughStripe', {
              _id: orderId,
              paymentIntent,
            }),
            createEvent('CheckoutCompleted', {
              _id: orderId,
              order: loadedOrder,
            }),
          ];
          //   events: [
          //     giftCardUsed,
          //     productsConfirmedToOrder,
          //     confirmationEmailQueued,
          // ]

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, events, { session });
          });
        });
      })
      .then(() => {});
  },
};

export default completeOrder;
