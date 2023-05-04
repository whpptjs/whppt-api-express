import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { WhpptRequest } from 'src';
import { capturePaymentIntent } from './capturePaymentIntent';
import { createPaymentIntent } from './createPaymentIntent';
import { getSavedCards } from './getSavedCards';
import { payWithSavedCard } from './payWithSavedCard';
import { saveCardOnContact } from './saveCardOnContact';
import { ContextType } from 'src/context/Context';
import {
  LoggedInMemberInfo,
  ParseMemberTokenFromCookie,
} from '../../modules/member/Secure';
import { LoggerService } from 'src/Services';

const router = Router();

export type StripeRouterConstructor = (
  $logger: LoggerService,
  apiPrefix: string
) => Router;

//TODO Need to get this from reading the config
const stripe = require('stripe')(process.env.STRIPE_KEY);

export type StripeToken = {
  object: string;
  secret: string;
};

export const StripeRouter: StripeRouterConstructor = function (__, apiPrefix) {
  router.post(`/${apiPrefix}/stripe/capturePaymentIntent`, (req, res) => {
    return (req as WhpptRequest).moduleContext
      .then(context => {
        const createEvent = context.CreateEvent(req.user);
        const ctx = { ...context, createEvent };
        return capturePaymentIntent({ context: ctx, stripe }, req.body).then(() => {
          return res.status(200).send({});
        });
      })
      .catch(err => res.status(err.status || 500).send(err.message || err));
  });

  router.post(`/${apiPrefix}/stripe/createPaymentIntent`, (req, res) => {
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
  router.post(`/${apiPrefix}/stripe/saveCardOnContact`, async (req, res) => {
    return saveCardOnContact(stripe, req.body)
      .then(() => res.status(200).send({}))
      .catch((err: any) => res.status(err.status || 500).send(err.message || err));
  });

  router.get(`/${apiPrefix}/stripe/getSavedCards`, (req, res) => {
    const { memberId } = req.query as { memberId: string };

    return (req as WhpptRequest).moduleContext
      .then(context =>
        memberSecure(context, req, memberId).then(() =>
          getSavedCards({ context, stripe }, { memberId })
        )
      )
      .then(data => {
        res.json(data);
      })
      .catch((err: any) => res.status(err.status || 500).send(err.message || err));
  });

  router.post(`/${apiPrefix}/stripe/payWithSavedCard`, (req, res) => {
    return (req as WhpptRequest).moduleContext.then(context => {
      const createEvent = context.CreateEvent(req.user);
      const ctx = { ...context, createEvent };
      return payWithSavedCard({ context: ctx, stripe }, req.body)
        .then(paymentIntent => res.json({ paymentIntent }))
        .catch((err: any) => res.status(err.status || 500).send(err.message || err));
    });
  });

  router.get(`/${apiPrefix}/stripe/createToken`, (__, res) => {
    return stripe.terminal.connectionTokens.create().then((token: StripeToken) => {
      res.json(token.secret);
    });
  });

  return router;
};

const memberSecure = (context: ContextType, req: any, memberId: string) => {
  return context.$hosting.then(config => {
    const staff = parseMemberTokenFromCookie(
      req.headers.staffauthtoken,
      config.security.appKey
    ) as any;
    if (staff?.sub?._id && staff?.sub?.isActive) {
      context.staff = staff;
      return Promise.resolve(true);
    }
    const member = parseMemberTokenFromCookie(
      req.headers.memberauthtoken,
      config.security.appKey
    );
    if (!member) return Promise.reject({ status: 404, message: 'Member not found' });
    context.member = member;

    if (context.member && context.member?.sub?._id === memberId)
      return Promise.resolve(true);

    return Promise.reject({ status: 401, message: 'Not Authrozided' });
  });
};

const parseMemberTokenFromCookie: ParseMemberTokenFromCookie = (
  memberauthtoken,
  appKey
) => {
  const token = memberauthtoken;
  var decoded = jwt.verify(token, appKey);

  return decoded as LoggedInMemberInfo;
};
