import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { calculateTotal } from 'src/modules/order/Queries/calculateTotal';

export type StripeToken = {
  object: string;
  secret: string;
};

export type CreatePaymentIntentWithSavedCardArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: { customerId: string; cardId: string; orderId: string }
) => Promise<string>;

export const createPaymentIntentWithSavedCard: CreatePaymentIntentWithSavedCardArgs = (
  { context, stripe },
  { customerId, cardId, orderId }
) => {
  assert(orderId, 'Order Id not provided');
  return calculateTotal(context, orderId).then(amount => {
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
        return intent.id;
      });
  });
};
