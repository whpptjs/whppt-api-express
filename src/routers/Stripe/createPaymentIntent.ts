import assert from 'assert';
import { Router } from 'express';
import { ContextType } from 'src/context/Context';
import { loadOrder, calculateTotal, getStripCustomerIdFromContact } from './Helpers';

export type StripeRouterConstructor = () => Router;

//TODO Need to get this from reading the config
const stripe = require('stripe')(process.env.STRIPE_KEY);

export type StripeToken = {
  object: string;
  secret: string;
};

export type CreatePaymentIntentArgs = (
  context: ContextType,
  args: { cardType: string; orderId: string; saveCard: boolean }
) => Promise<{ client_secret: string; amount: number; customer: string }>;

export const createPaymentIntent: CreatePaymentIntentArgs = (
  context,
  { cardType = 'card_present', orderId, saveCard }
) => {
  assert(orderId, 'Order Id not provided');
  return loadOrder(context, orderId).then(order => {
    return calculateTotal(context, orderId).then(amount => {
      return getStripCustomerIdFromContact(context, stripe, order.contactId).then(
        customer => {
          return stripe.paymentIntents
            .create({
              amount,
              currency: 'aud',
              payment_method_types: [cardType],
              capture_method: 'automatic',
              customer,
              setup_future_usage: saveCard ? 'off_session' : undefined,
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
