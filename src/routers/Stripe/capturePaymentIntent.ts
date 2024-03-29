import assert from 'assert';
import { ContextType } from 'src/context/Context';
import confirmStripePayment from '../../modules/order/confirmStripePayment';

export type CapturePaymentIntentArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: { paymentId: string; orderId: string; domainId: string }
) => Promise<void>;

export const capturePaymentIntent: CapturePaymentIntentArgs = (
  { context, stripe },
  { paymentId, orderId, domainId }
) => {
  assert(orderId, 'Order Id not provided');
  assert(paymentId, 'Payment Id not provided');
  return stripe.paymentIntents.capture(paymentId).then(() => {
    return confirmStripePayment.exec(context, {
      paymentIntent: paymentId,
      orderId,
      domainId,
    });
  });
};
