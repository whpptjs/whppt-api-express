import assert from 'assert';
import { Router } from 'express';
import { WhpptRequest } from 'src';
import { calculateTotal, getStripCustomerIdFromContact, loadOrder } from './common';

const router = Router();

export type StripeRouterConstructor = () => Router;

const stripe = require('stripe')(process.env.STRIPE_KEY);

export type StripeToken = {
  object: string;
  secret: string;
};

export const StripeRouter: StripeRouterConstructor = function () {
  router.post('/stripe/createPaymentIntent', (req, res) => {
    return (req as WhpptRequest).moduleContext
      .then(context => {
        const createEvent = context.CreateEvent(req.user);
        const ctx = { ...context, createEvent };
        const { cardType = 'card_present', orderId, saveCard } = req.body;
        assert(orderId, 'Order Id not provided');
        return loadOrder(ctx, orderId).then(order => {
          return calculateTotal(ctx, orderId).then(amount => {
            return getStripCustomerIdFromContact(ctx, stripe, order.contactId).then(
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
                    return ctx.$database
                      .then(database => {
                        const { document, startTransaction } = database;
                        return startTransaction(session => {
                          Object.assign(order, {
                            stripe: { intentId: intent.id, status: 'pending', amount },
                          });

                          const events = [
                            ctx.createEvent('OrderCreatedPaymentIntent', {
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
                        res.json({
                          client_secret: intent.client_secret,
                          amount,
                          customer,
                        });
                      });
                  });
              }
            );
          });
        });
      })
      .catch(err => {
        res.status(err.status || 500).send(err.message || err);
      });
  });
  router.post('/stripe/saveCardOnContact', async (req, res) => {
    const { paymentMethod, customerId } = req.body;

    return stripe.paymentMethods
      .attach(paymentMethod, { customer: customerId })
      .then(() => {
        return res.status(200).send({});
      })
      .catch((err: any) => {
        if (
          err.raw.message ===
          'The payment method you provided has already been attached to a customer.'
        )
          return res.status(200).send({});
        res.status(err.status || 500).send(err.message || err);
      });
  });

  router.get('/stripe/getSavedCards', (req, res) => {
    const { contactId } = req.query;

    return (req as WhpptRequest).moduleContext.then(context => {
      assert(contactId, 'ContactId not provided');
      return getStripCustomerIdFromContact(context, stripe, contactId as string).then(
        customer => {
          return stripe.customers
            .listPaymentMethods(customer, { type: 'card' })
            .then((cards: any) => {
              console.log('🚀 ~ file: Stripe.ts ~ line 21 ~ ).then ~ token', cards);
              res.json(cards);
            });
        }
      );
    });
  });

  // Below are Not in use yet. Dont delete --- Ben

  // router.get('/stripe/createToken', (__, res) => {
  //   return stripe.terminal.connectionTokens.create().then((token: StripeToken) => {
  //     res.json(token.secret);
  //   });
  // });
  // router.post('/stripe/createPaymentIntentWithExistingCustomer', (req, res) => {
  //   const { amount = 2000 } = req.body;
  //   //TODO make this work
  //   return stripe.customers.create().then(customer => {
  //     return stripe.paymentIntents
  //       .create({
  //         amount,
  //         currency: 'aud',
  //         payment_method_types: ['card_present'],
  //         customer: customer.id,
  //         capture_method: 'manual',
  //       })
  //       .then((intent: StripeToken) => {
  //         console.log('🚀 ~ file: Stripe.ts ~ line 38 ~ .then ~ intent', intent);
  //         res.json({
  //           id: intent.id,
  //           client_secret: intent.client_secret,
  //         });
  //       });
  //   });
  // });

  // router.post('/stripe/createPaymentIntentWithNewCustomer', (req, res) => {
  //   const { amount = 2000 } = req.body;
  //   return stripe.customers.create().then(customer => {
  //     return stripe.paymentIntents
  //       .create({
  //         amount,
  //         currency: 'aud',
  //         payment_method_types: ['card_present'],
  //         customer: customer.id,
  //         setup_future_usage: 'off_session',
  //         capture_method: 'manual',
  //       })
  //       .then((intent: StripeToken) => {
  //         console.log('🚀 ~ file: Stripe.ts ~ line 38 ~ .then ~ intent', intent);
  //         res.json({
  //           id: intent.id,
  //           client_secret: intent.client_secret,
  //         });
  //       });
  //   });
  // });
  // router.post('/stripe/createPaymentIntentWithSavedCard', (req, res) => {
  //   const { amount, cardType = 'card', customerId, cardId } = req.body;
  //   return stripe.paymentIntents
  //     .create({
  //       amount,
  //       currency: 'aud',
  //       payment_method_types: [cardType],
  //       capture_method: 'automatic',
  //       customer: customerId,
  //       payment_method: cardId,
  //       setup_future_usage: 'off_session',
  //       confirm: true,
  //     })
  //     .then(intent => {
  //       res.json(intent);
  //     });
  // });

  // router.post('/stripe/capturePaymentIntent', async (req, res) => {
  //   const { paymentId } = req.body;
  //   return stripe.paymentIntents.capture(paymentId).then(x => {
  //     res.json(x);
  //   });
  // });

  return router;
};
