import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import * as validations from './Validations';

const confirmStripePayment: HttpModule<{ orderId: string; paymentIntent: string }, void> =
  {
    exec({ $database, createEvent }, { orderId, paymentIntent }) {
      assert(orderId, 'Order Id not found');
      assert(paymentIntent, 'Payment Intent not provided');
      return $database.then(({ document, startTransaction }) => {
        return document.fetch<Order>('orders', orderId).then(loadedOrder => {
          assert(loadedOrder, 'Order not found');
          validations.canBeModified(loadedOrder);

          assert(
            loadedOrder.stripe?.intentId === paymentIntent,
            'Payment Intent Id doesnt not match'
          );

          assign(loadedOrder, {
            ...loadedOrder,
            stripe: {
              ...loadedOrder.stripe,
              status: 'paid',
              intentId: loadedOrder.stripe.intentId || paymentIntent,
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
      });
    },
  };

export default confirmStripePayment;
