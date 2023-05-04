import assert from 'assert';
import { assign, omit } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order, OrderItemWithProduct } from './Models/Order';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { getOrderTemplate } from '../email/Templates/emailReceipt';

import * as validations from './Validations';

const confirmStripePayment: HttpModule<{ orderId: string; paymentIntent: string }, void> =
  {
    exec(context, { orderId, paymentIntent }) {
      assert(orderId, 'Order Id not found');
      assert(paymentIntent, 'Payment Intent not provided');
      return context.$database.then(({ document, startTransaction }) => {
        return document.fetch<Order>('orders', orderId).then(loadedOrder => {
          return loadOrderWithProducts(context, { _id: orderId }).then(
            orderWithProducts => {
              assert(loadedOrder, 'Order not found');
              validations.canBeModified(loadedOrder);

              assert(
                loadedOrder.stripe?.intentId === paymentIntent,
                'Payment Intent Id doesnt not match'
              );

              assign(loadedOrder, {
                ...loadedOrder,
                stripe: {
                  ...loadedOrder.stripe,
                  status: 'paid',
                  intentId: loadedOrder.stripe.intentId || paymentIntent,
                  date: new Date(),
                },
                payment: {
                  ...loadedOrder.payment,
                  status: 'paid',
                  date: new Date(),
                  type: 'card',
                },
                checkoutStatus: 'paid',
                items: orderWithProducts.items.map((item: OrderItemWithProduct) => {
                  return omit(
                    {
                      ...item,
                      purchasedPrice: item.overidedPrice || item.product?.price,
                      originalPrice: item.product?.price,
                    },
                    'product'
                  );
                }),
              });
              const events = [
                context.createEvent('OrderPaymentConfirmedThroughStripe', {
                  _id: orderId,
                  paymentIntent,
                }),
                context.createEvent('ProductsConfirmedToOrder', {
                  _id: orderId,
                  items: loadedOrder.items,
                }),
              ];

              //TODO add these events
              //   events: [
              //     giftCardUsed,
              // ]

              return startTransaction(session => {
                return document.saveWithEvents('orders', loadedOrder, events, {
                  session,
                });
              }).then(() => {
                const email = orderWithProducts?.contact?.email;
                if (!email) return Promise.resolve();
                return context.$email.send({
                  to: email,
                  subject: `Hentley Farm receipt${
                    orderWithProducts.orderNumber || orderWithProducts._id
                      ? ` for order #${
                          orderWithProducts.orderNumber || orderWithProducts._id
                        }`
                      : ''
                  }`,
                  html: getOrderTemplate(orderWithProducts),
                });
              });
            }
          );
        });
      });
    },
  };

export default confirmStripePayment;
