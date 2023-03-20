import assert from 'assert';
import { Router } from 'express';
import { ContextType } from 'src/context/Context';
import { calculateTotal } from '../../modules/order/Queries/calculateTotal';
import { loadOrder } from '../../modules/order/Queries/loadOrder';
import { getStripCustomerIdFromMember } from './Queries';

export type StripeRouterConstructor = () => Router;

export type StripeToken = {
  object: string;
  secret: string;
};

export type CreatePaymentIntentArgs = (
  contextArgs: { context: ContextType; stripe: any },
  args: {
    cardType: string;
    orderId: string;
    saveCard: boolean;
    ageConfirmed: boolean;
    domainId: string;
  }
) => Promise<{ client_secret: string; amount: number; customer: string }>;

export const createPaymentIntent: CreatePaymentIntentArgs = (
  { context, stripe },
  { cardType = 'card_present', orderId, saveCard, ageConfirmed, domainId }
) => {
  assert(ageConfirmed, 'Must be over 18');
  assert(orderId, 'Order Id not provided');
  return loadOrder(context, orderId).then(order => {
    return calculateTotal(context, { orderId, domainId, memberId: order.memberId }).then(
      ({
        shippingCost,
        total,
        subTotal,
        memberTotalDiscount,
        memberShippingDiscount,
        originalTotal,
        overrideTotalPrice,
        discountApplied,
        originalSubTotal,
      }) => {
        return getStripCustomerIdFromMember(context, stripe, order.memberId).then(
          customer => {
            return stripe.paymentIntents
              .create({
                amount: Math.round(total),
                currency: 'aud',
                payment_method_types: [cardType],
                capture_method: cardType === 'card_present' ? 'manual' : 'automatic',
                customer,
                setup_future_usage: saveCard && customer ? 'off_session' : undefined,
              })
              .then((intent: { client_secret: string; id: string }) => {
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
                          originalTotal,
                          overrideTotalPrice,
                          discountApplied,
                          originalSubTotal,
                        },
                      });

                      const events = [
                        context.createEvent('OrderShipingCalculated', {
                          _id: order._id,
                          shippingCost,
                        }),
                        context.createEvent('OrderCreatedPaymentIntent', {
                          _id: order._id,
                          stripe: {
                            intentId: intent.id,
                            status: 'pending',
                            amount: total,
                            originalTotal,
                            overrideTotalPrice,
                            discountApplied,
                            originalSubTotal,
                          },
                          ageConfirmed,
                        }),
                      ];

                      return document.saveWithEvents('orders', order, events, {
                        session,
                      });
                    });
                  })
                  .then(() => {
                    return {
                      client_secret: intent.client_secret,
                      amount: total,
                      customer,
                    };
                  });
              });
          }
        );
      }
    );
  });
};
