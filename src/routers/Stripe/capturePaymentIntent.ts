import assert from 'assert';
import { ContextType } from 'src/context/Context';
import confirmStripePayment from '../../modules/order/confirmStripePayment';

export type CapturePaymentIntentArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: { paymentId: string; orderId: string }
) => Promise<void>;

export const capturePaymentIntent: CapturePaymentIntentArgs = (
  { context, stripe },
  { paymentId, orderId }
) => {
  console.log('🚀 ~ file: capturePaymentIntent.ts ~ line 14 ~ orderId', orderId);
  assert(orderId, 'Order Id not provided');
  assert(paymentId, 'Payment Id not provided');
  return stripe.paymentIntents.capture(paymentId).then(() => {
    return confirmStripePayment.exec(context, { paymentIntent: paymentId, orderId });
  });
};
