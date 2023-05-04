import { queryMemberTier } from './../../modules/order/Queries/queryMemberTier';
import { Router } from 'express';
import { WhpptRequest } from 'src';
import buildDispatchListPdf from './Dispatch/buildDispatchListPdf';
import { Staff } from './../../modules/staff/Model';
import { composeOrderData } from './Dispatch/composeOrderData';
import { Contact } from './../../modules/contact/Models/Contact';
import { Product } from './../../modules/product/Models/Product';
import { OrderItem } from './../../modules/order/Models/Order';
import buildReceiptPdf from './Order/buildReceiptPdf';
import { loadOrderWithProducts } from './../../modules/order/Queries/loadOrderWithProducts';

export type OrderWithProductInfo = {
  orderId: any;
  updatedAt: any;
  shipping: {
    contact: any;
    street: string;
    state: string;
    country: string;
  };
  items: any;
  note: any;
  staffContactInfo: any;
};

const router = Router();

export const PdfRouter = (apiPrefix: string) => {
  router.get(`/${apiPrefix}/pdf/dispatchList/:orderIds`, (req: any, res: any) => {
    const ordersWithProductInfo: OrderWithProductInfo[] = [];
    const orderIds = req.params.orderIds.split(',');

    return (req as WhpptRequest).moduleContext
      .then(context => {
        Promise.all([
          ...orderIds.map((orderId: any) => {
            return loadOrderWithProducts(context, { _id: orderId }).then(
              orderWithProducts => {
                if (orderWithProducts.staffId) {
                  return context.$database.then(database => {
                    const { document } = database;

                    return document
                      .query<Staff>('staff', {
                        filter: { _id: orderWithProducts.staffId },
                      })
                      .then(staff => {
                        if (staff) {
                          return document
                            .query<Contact>('contacts', {
                              filter: { _id: staff.contactId },
                            })
                            .then(staffContactInfo => {
                              return ordersWithProductInfo.push(
                                composeOrderData({
                                  ...orderWithProducts,
                                  staffContactInfo,
                                })
                              );
                            });
                        } else {
                          return ordersWithProductInfo.push(
                            composeOrderData(orderWithProducts)
                          );
                        }
                      });
                  });
                } else {
                  return ordersWithProductInfo.push(composeOrderData(orderWithProducts));
                }
              }
            );
          }),
        ]).then(() => {
          ordersWithProductInfo.forEach((order: OrderWithProductInfo) => {
            order.items.map(
              (product: OrderItem & { product: Product & { vintage: string } }) => {
                return {
                  name: product.product?.name,
                  vintage: product.product?.vintage,
                  quantity: product.quantity,
                };
              }
            );
          });

          return createPdfBinary(
            buildDispatchListPdf({ products: ordersWithProductInfo }),
            function (binary: any) {
              res.contentType('application/pdf');
              res.send(binary);
            }
          );
        });
      })
      .catch(err => {
        console.log('🚀 PDF err:', err);
        return res.status(500).send(`PDF router failed: ${err.message}`);
      });
  });

  router.get(`/${apiPrefix}/pdf/orderReceipt`, (req: any, res: any) => {
    const orderId = req.query.orderId;
    const domainId = req.query.domainId;

    return (req as WhpptRequest).moduleContext
      .then(context => {
        return loadOrderWithProducts(context, { _id: orderId }).then(order => {
          return context.$database.then(database => {
            const { document } = database;

            if (order.memberId) {
              return queryMemberTier(context, {
                memberId: order.memberId,
                domainId,
              }).then((memberTier: any) => {
                return document
                  .query<Contact>('contacts', {
                    filter: { _id: order.contact?._id },
                  })
                  .then(contact => {
                    return createPdfBinary(
                      buildReceiptPdf({ order, contact, memberTier }),
                      function (binary: any) {
                        res.contentType('application/pdf');
                        res.send(binary);
                      }
                    );
                  });
              });
            } else {
              return document
                .query<Contact>('contacts', {
                  filter: { _id: order.contact?._id },
                })
                .then(contact => {
                  return createPdfBinary(
                    buildReceiptPdf({ order, contact }),
                    function (binary: any) {
                      res.contentType('application/pdf');
                      res.send(binary);
                    }
                  );
                });
            }
          });
        });
      })
      .catch(err => {
        console.log('🚀 PDF err:', err);
        return res.status(500).send(`PDF router failed: ${err.message}`);
      });
  });

  return router;
};

const createPdfBinary = (doc: any, callback: any) => {
  const chunks: any = [];
  let result;

  doc.on('data', function (chunk: any) {
    chunks.push(chunk);
  });
  doc.on('end', function () {
    result = Buffer.concat(chunks);
    callback(result);
  });
  doc.end();
};
