import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';

const confirmStripePayment: HttpModule<{ orderId: string; paymentIntent: string }, void> =
  {
    exec({ $database, createEvent }, { orderId, paymentIntent }) {
      assert(orderId, 'Order Id not found');
      assert(paymentIntent, 'Payment Intent not provided');
      return $database
        .then(({ document, startTransaction }) => {
          return document.fetch('orders', orderId).then(loadedOrder => {
            assert(loadedOrder, 'Order not found');
            assert(loadedOrder.checkoutStatus === 'pending', 'Order already completed.');
            assert(
              loadedOrder.stripe.intentId === paymentIntent,
              'Payment Intent Id doesnt not match'
            );

            assign(loadedOrder, {
              ...loadedOrder,
              stripe: {
                ...loadedOrder.stripe,
                status: 'paid',
              },
              checkoutStatus: 'paid',
            });

            const events = [
              createEvent('OrderPaymentConfirmedThroughStripe', {
                _id: orderId,
                paymentIntent,
              }),
            ];

            //TODO add these events
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

export default confirmStripePayment;
