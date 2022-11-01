import { Router } from 'express';
import { ContextType } from 'src/context/Context';

export type StripeRouterConstructor = () => Router;

export type StripeToken = {
  object: string;
  secret: string;
};

export type SaveCardOnContactArgs = (
  context: ContextType,
  args: { paymentMethod: string; customerId: string }
) => Promise<void>;

export const saveCardOnContact: SaveCardOnContactArgs = (
  stripe,
  { paymentMethod, customerId }
) => {
  return stripe.paymentMethods
    .attach(paymentMethod, { customer: customerId })
    .catch((err: any) => {
      if (
        err.raw.message ===
        'The payment method you provided has already been attached to a customer.'
      )
        return;
      throw Error(err);
    });
};
