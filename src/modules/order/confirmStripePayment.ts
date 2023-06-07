import assert from 'assert';
import { assign, omit } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order, OrderItemWithProduct } from './Models/Order';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { getOrderTemplate } from '../email/Templates/emailReceipt';

import * as validations from './Validations';
import { updateProductQuantity } from '../product/Helpers/UpdateProductQuantity';

const confirmStripePayment: HttpModule<
  { orderId: string; paymentIntent: string; domainId: string },
  void
> = {
  exec(context, { orderId, paymentIntent, domainId }) {
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
            })
              .then(() => {
                return Promise.all(
                  loadedOrder.items.map(item => {
                    return updateProductQuantity(context, item);
                  })
                );
              })
              .then(() => {
                const email = orderWithProducts?.contact?.email;
                if (!email) return Promise.resolve();
                const paidOrderWithProducts = {
                  ...loadedOrder,
                  items: loadedOrder.items.map(lo => {
                    const orderItem = orderWithProducts.items.find(
                      i => i._id === lo._id
                    ) as OrderItemWithProduct;
                    return {
                      ...lo,
                      product: orderItem.product || {},
                    };
                  }),
                };
                return context.$email
                  .send({
                    to: email,
                    subject: `Hentley Farm receipt${
                      paidOrderWithProducts.orderNumber || paidOrderWithProducts._id
                        ? ` for order #${
                            paidOrderWithProducts.orderNumber || paidOrderWithProducts._id
                          }`
                        : ''
                    }`,
                    html: getOrderTemplate(paidOrderWithProducts, domainId),
                  })
                  .catch(() => {
                    throw new Error(
                      'Confirmation email sending failed. Order was processed and paid for.'
                    );
                  });
              });
          }
        );
      });
    });
  },
};

export default confirmStripePayment;
