import assert from 'assert';
import { Router } from 'express';
import { ContextType } from 'src/context/Context';
import { calculateTotal } from '../../modules/order/Queries/calculateTotal';
import { loadOrder } from '../../modules/order/Queries/loadOrder';
import { getStripCustomerIdFromContact } from './Queries';

export type StripeRouterConstructor = () => Router;

export type StripeToken = {
  object: string;
  secret: string;
};

export type CreatePaymentIntentArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: { cardType: string; orderId: string; saveCard: boolean }
) => Promise<{ client_secret: string; amount: number; customer: string }>;

export const createPaymentIntent: CreatePaymentIntentArgs = (
  { context, stripe },
  { cardType = 'card_present', orderId, saveCard }
) => {
  assert(orderId, 'Order Id not provided');
  return loadOrder(context, orderId).then(order => {
    return calculateTotal(context, orderId).then(({ total: amount }) => {
      return getStripCustomerIdFromContact(context, stripe, order.contact?._id).then(
        customer => {
          return stripe.paymentIntents
            .create({
              amount,
              currency: 'aud',
              payment_method_types: [cardType],
              capture_method: 'automatic',
              customer,
              setup_future_usage: saveCard && customer ? 'off_session' : undefined,
            })
            .then((intent: { client_secret: string; id: string }) => {
              return context.$database
                .then(database => {
                  const { document, startTransaction } = database;
                  return startTransaction(session => {
                    Object.assign(order, {
                      stripe: { intentId: intent.id, status: 'pending', amount },
                    });

                    const events = [
                      context.createEvent('OrderCreatedPaymentIntent', {
                        _id: order._id,
                        stripe: { intentId: intent.id, status: 'pending', amount },
                      }),
                    ];

                    return document.saveWithEvents('orders', order, events, {
                      session,
                    });
                  });
                })
                .then(() => {
                  return {
                    client_secret: intent.client_secret,
                    amount,
                    customer,
                  };
                });
            });
        }
      );
    });
  });
};
