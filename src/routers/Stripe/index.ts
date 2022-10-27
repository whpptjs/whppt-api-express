import assert from 'assert';
import { Router } from 'express';
import { WhpptRequest } from 'src';
import { getStripCustomerIdFromContact, loadOrder } from './common';

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
      .then(ctx => {
        const { amount, cardType = 'card_present', orderId, saveCard } = req.body;
        assert(orderId, 'Order Id not provided');
        return loadOrder(ctx, orderId).then(order => {
          //compare prices assert.
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
                .then((intent: { client_secret: string }) => {
                  console.log('🚀 ~ file: index.ts ~ line 37 ~ .then ~ intent', intent);
                  res.json({ client_secret: intent.client_secret });
                });
            }
          );
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
      .catch((err: any) => {
        if (
          err.raw.message ===
          'The payment method you provided has already been attached to a customer.'
        )
          return res.status(200).send('Ok');
        console.log('🚀 ~ file: index.ts ~ line 53 ~ router.post ~ err', err);
        res.status(err.status || 500).send(err.message || err);
      });
  });

  // Below are Not in use yet. Dont delete --- Ben

  // router.get('/stripe/listCustomerAccount', (__, res) => {
  //   // return stripe.paymentMethods
  //   //   .retrieve('pm_1LwwFwLi5iu0zliSTe5heDfo')
  //   //   .then((token: any) => {
  //   //     console.log('🚀 ~ file: Stripe.ts ~ line 21 ~ ).then ~ token', token);
  //   //     res.json(token);
  //   //   });
  //   // pm_1LwwFwLi5iu0zliSTe5heDfo
  //   return stripe.customers
  //     .listPaymentMethods('cus_Mg6R3qFPKnNRzL', { type: 'card' })
  //     .then((token: any) => {
  //       console.log('🚀 ~ file: Stripe.ts ~ line 21 ~ ).then ~ token', token);
  //       res.json(token);
  //     });
  // });
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
