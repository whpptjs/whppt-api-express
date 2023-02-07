import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { calculateTotal } from '../../modules/order/Queries/calculateTotal';
import { loadOrder } from '../../modules/order/Queries/loadOrder';

export type StripeToken = {
  object: string;
  secret: string;
};

export type PayWithSavedCardArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: {
    customerId: string;
    cardId: string;
    orderId: string;
    ageConfirmed: boolean;
    domainId: string;
  }
) => Promise<string>;

export const payWithSavedCard: PayWithSavedCardArgs = (
  { context, stripe },
  { customerId, cardId, orderId, ageConfirmed, domainId }
) => {
  assert(orderId, 'Order Id not provided');
  return loadOrder(context, orderId).then(order => {
    return calculateTotal(context, { orderId, domainId, memberId: order.memberId }).then(
      ({
        shippingCost,
        total,
        subTotal,
        memberTotalDiscount,
        memberShippingDiscount,
      }) => {
        return stripe.paymentIntents
          .create({
            amount: Math.round(total),
            currency: 'aud',
            payment_method_types: ['card'],
            capture_method: 'automatic',
            customer: customerId,
            payment_method: cardId,
            setup_future_usage: 'off_session',
            confirm: true,
          })
          .then((intent: any) => {
            return context.$database
              .then(database => {
                const { document, startTransaction } = database;
                return startTransaction(session => {
                  Object.assign(order, {
                    stripe: { intentId: intent.id, status: 'pending', amount: total },
                    ageConfirmed,
                    shipping: { ...order.shipping, shippingCost },
                    payment: {
                      status: 'pending',
                      amount: total,
                      subTotal,
                      memberTotalDiscount,
                      memberShippingDiscount,
                      shippingCost,
                    },
                  });

                  const events = [
                    context.createEvent('OrderShipingCalculated', {
                      _id: order._id,
                      shippingCost,
                    }),
                    context.createEvent('OrderCreatedPaymentIntentForSavedCard', {
                      _id: order._id,
                      stripe: {
                        intentId: intent.id,
                        status: 'pending',
                        amount: total,
                        customerId,
                        cardId,
                      },
                      ageConfirmed,
                    }),
                  ];

                  return document.saveWithEvents('orders', order, events, {
                    session,
                  });
                });
              })
              .then(() => intent.id);
          });
      }
    );
  });
};
