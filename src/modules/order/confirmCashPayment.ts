import { fromBase64 } from 'b64-lite';
import { assign, omit } from 'lodash';
import { HttpModule } from '../HttpModule';
import assert from 'assert';
import { Secure } from '../staff/Secure';
import * as validations from './Validations';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';
import { Order, OrderItemWithProduct } from './Models/Order';
import { calculateTotal } from '../../modules/order/Queries/calculateTotal';
import { Staff } from '../staff/Model';
import { getOrderTemplate } from '../email/Templates/emailReceipt';
import { createPdfBinary } from '../../routers/Pdf';
import buildReceiptPdf from '../../routers/Pdf/Order/buildReceiptPdf';
import { Contact } from '../contact/Models/Contact';

const confirmCashPayment: HttpModule<
  { staffMemberId: string; orderId: string; domainId: string },
  any
> = {
  exec(context, { staffMemberId, orderId, domainId }) {
    assert(orderId, 'An Order id is required');
    assert(domainId, 'Domain Id is required.');
    assert(staffMemberId, 'Staff member ID is required');

    return context.$database.then(db => {
      const { document, startTransaction } = db;

      return document.fetch<Staff>('staff', staffMemberId).then(staffMember => {
        assert(staffMember && staffMember.isActive, 'Staff member not found');

        return document.fetch<Order>('orders', orderId).then(loadedOrder => {
          return calculateTotal(context, {
            orderId,
            domainId,
            memberId: loadedOrder.memberId,
          }).then(
            ({
              shippingCost,
              total,
              subTotal,
              memberTotalDiscount,
              memberShippingDiscount,
              originalTotal,
              originalSubTotal,
              overrideTotalPrice,
              discountApplied,
            }) => {
              return loadOrderWithProducts(context, { _id: orderId }).then(
                orderWithProducts => {
                  assert(loadedOrder, 'Order not found');
                  validations.canBeModified(loadedOrder);

                  assign(loadedOrder, {
                    ...loadedOrder,
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
                    payment: {
                      status: 'paid',
                      type: 'cash',
                      date: new Date(),
                      amount: total,
                      subTotal,
                      memberTotalDiscount,
                      memberShippingDiscount,
                      shippingCost,
                      originalTotal,
                      originalSubTotal,
                      overrideTotalPrice,
                      discountApplied,
                    },
                  });

                  const events = [
                    context.createEvent('OrderCashPaymentConfirmed', {
                      _id: orderId,
                      staffMemberId: staffMemberId,
                      amount: total,
                      subTotal,
                      memberTotalDiscount,
                      memberShippingDiscount,
                      shippingCost,
                      originalTotal,
                      originalSubTotal,
                      overrideTotalPrice,
                      discountApplied,
                    }),
                    context.createEvent('ProductsConfirmedToOrder', {
                      _id: orderId,
                      items: loadedOrder.items,
                    }),
                  ];

                  return startTransaction((session: any) => {
                    return document.saveWithEvents('orders', loadedOrder, events, {
                      session,
                    });
                  }).then(() => {
                    const email = loadedOrder?.contact?.email;
                    if (!email || !loadedOrder.contact?._id) return Promise.resolve();
                    return document
                      .query<Contact>('contacts', {
                        filter: { _id: loadedOrder.contact?._id },
                      })
                      .then(contact => {
                        if (!contact) return Promise.resolve();
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
                        return createPdfBinary(
                          buildReceiptPdf({ order: paidOrderWithProducts, contact }),
                          function (binary: any) {
                            // res.contentType('application/pdf');
                            // res.send(binary);
                            const attachmentContent = fromBase64(binary);

                            const attachments = [
                              {
                                Filename: 'attachment.pdf',
                                Data: attachmentContent,
                              },
                            ];
                            return context.$email
                              .send(
                                {
                                  to: email,
                                  subject: `Hentley Farm receipt${
                                    paidOrderWithProducts.orderNumber ||
                                    paidOrderWithProducts._id
                                      ? ` for order #${
                                          paidOrderWithProducts.orderNumber ||
                                          paidOrderWithProducts._id
                                        }`
                                      : ''
                                  }`,
                                  html: getOrderTemplate(paidOrderWithProducts),
                                },
                                attachments
                              )
                              .catch(() => {
                                throw new Error(
                                  'Confirmation email sending failed. Order was processed and paid for.'
                                );
                              });
                          }
                        );
                      });
                  });
                }
              );
            }
          );
        });
      });
    });
  },
};

export default Secure(confirmCashPayment);
