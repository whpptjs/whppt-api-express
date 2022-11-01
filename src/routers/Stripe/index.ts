import { Router } from 'express';
import { WhpptRequest } from 'src';
import { createPaymentIntent } from './createPaymentIntent';
import { getSavedCards } from './getSavedCards';
import { payWithSavedCard } from './payWithSavedCard';
import { saveCardOnContact } from './saveCardOnContact';

const router = Router();

export type StripeRouterConstructor = () => Router;

//TODO Need to get this from reading the config
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
        return createPaymentIntent({ context: ctx, stripe }, req.body).then(data =>
          res.json(data)
        );
      })
      .catch(err => res.status(err.status || 500).send(err.message || err));
  });
  router.post('/stripe/saveCardOnContact', async (req, res) => {
    return saveCardOnContact(stripe, req.body)
      .then(() => res.status(200).send({}))
      .catch((err: any) => res.status(err.status || 500).send(err.message || err));
  });

  router.get('/stripe/getSavedCards', (req, res) => {
    const { contactId } = req.query as { contactId: string };
    return (req as WhpptRequest).moduleContext
      .then(context => getSavedCards({ context, stripe }, { contactId }))
      .then(data => {
        res.json(data);
      })
      .catch((err: any) => res.status(err.status || 500).send(err.message || err));
  });

  router.post('/stripe/payWithSavedCard', (req, res) => {
    return (req as WhpptRequest).moduleContext.then(context => {
      const createEvent = context.CreateEvent(req.user);
      const ctx = { ...context, createEvent };
      return payWithSavedCard({ context: ctx, stripe }, req.body)
        .then(paymentIntent => res.json({ paymentIntent }))
        .catch((err: any) => res.status(err.status || 500).send(err.message || err));
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

  // router.post('/stripe/capturePaymentIntent', async (req, res) => {
  //   const { paymentId } = req.body;
  //   return stripe.paymentIntents.capture(paymentId).then(x => {
  //     res.json(x);
  //   });
  // });

  return router;
};
