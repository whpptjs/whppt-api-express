import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { calculateTotal } from '../../modules/order/Queries/calculateTotal';
import { loadOrder } from '../../modules/order/Queries/loadOrder';

export type StripeToken = {
  object: string;
  secret: string;
};

export type PayWithSavedCardArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: { customerId: string; cardId: string; orderId: string; domainId: string }
) => Promise<string>;

export const payWithSavedCard: PayWithSavedCardArgs = (
  { context, stripe },
  { customerId, cardId, orderId, domainId }
) => {
  assert(orderId, 'Order Id not provided');
  return calculateTotal(context, { orderId, domainId }).then(amount => {
    return loadOrder(context, orderId).then(order => {
      return stripe.paymentIntents
        .create({
          amount,
          currency: 'aud',
          payment_method_types: ['card'],
          capture_method: 'automatic',
          customer: customerId,
          payment_method: cardId,
          setup_future_usage: 'off_session',
          confirm: true,
        })
        .then((intent: any) => {
          return context.$database
            .then(database => {
              const { document, startTransaction } = database;
              return startTransaction(session => {
                Object.assign(order, {
                  stripe: { intentId: intent.id, status: 'pending', amount },
                });

                const events = [
                  context.createEvent('OrderCreatedPaymentIntentForSavedCard', {
                    _id: order._id,
                    stripe: {
                      intentId: intent.id,
                      status: 'pending',
                      amount,
                      cardId,
                      customerId,
                    },
                  }),
                ];

                return document.saveWithEvents('orders', order, events, {
                  session,
                });
              });
            })
            .then(() => intent.id);
        });
    });
  });
};
