import { Router } from 'express';
import { WhpptRequest } from 'src';
import { capturePaymentIntent } from './capturePaymentIntent';
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
  router.post('/stripe/capturePaymentIntent', (req, res) => {
    return (req as WhpptRequest).moduleContext
      .then(context => {
        const createEvent = context.CreateEvent(req.user);
        const ctx = { ...context, createEvent };
        console.log('🚀 ~ file: index.ts ~ line 28 ~ router.post ~ req.body', req.body);
        return capturePaymentIntent({ context: ctx, stripe }, req.body).then(() => {
          return res.status(200).send({});
        });
      })
      .catch(err => res.status(err.status || 500).send(err.message || err));
  });

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
    const { memberId } = req.query as { memberId: string };
    return (req as WhpptRequest).moduleContext
      .then(context => getSavedCards({ context, stripe }, { memberId }))
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

  router.get('/stripe/createToken', (__, res) => {
    return stripe.terminal.connectionTokens.create().then((token: StripeToken) => {
      res.json(token.secret);
    });
  });

  return router;
};
