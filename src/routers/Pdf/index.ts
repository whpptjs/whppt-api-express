import { Router } from 'express';
import { WhpptRequest } from 'src';
import buildPdf from './buildPdf';
import { loadOrderWithProducts } from '../../../src/modules/order/Queries/loadOrderWithProducts';
import { Staff } from 'src/modules/staff/Model';
import { composeOrderData } from './composeOrderData';
import { Contact } from 'src/modules/contact/Models/Contact';
import { Product } from 'src/modules/product/Models/Product';
import { OrderItem } from 'src/modules/order/Models/Order';

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

export const PdfRouter = () => {
  const router = Router();

  router.get('/pdf/create/:orderIds', (req: any, res: any) => {
    const ordersWithProductInfo: OrderWithProductInfo[] = [];
    const orderIds = req.params.orderIds.split(',');

    return (req as WhpptRequest).moduleContext.then(context => {
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
                              composeOrderData({ ...orderWithProducts, staffContactInfo })
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
          {
            products: ordersWithProductInfo,
          },
          function (binary: any) {
            res.contentType('application/pdf');
            res.send(binary);
          }
        );
      });
    });
  });

  return router;
};

const createPdfBinary = ({ products }: { products: any }, callback: any) => {
  const doc = buildPdf({ products });

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
