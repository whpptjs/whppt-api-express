import { Router } from 'express';
import { WhpptRequest } from 'src';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { Order } from 'src/modules/order/Models/Order';
import * as csv from 'fast-csv';
import { loadOrderWithProducts } from '../../modules/order/Queries/loadOrderWithProducts';

const router = Router();

export const CsvRouter = () => {
  router.get('/csv/productSales', (req: any, res: any) => {
    return (req as WhpptRequest).moduleContext.then(context => {
      return context.$database.then(database => {
        const { db } = database as WhpptMongoDatabase;
        const { dateFrom, dateTo, origin, marketArea, customerId } = req.query;

        const query = {
          $and: [{ _id: { $exists: true } }],
        } as any;

        if (dateFrom) {
          query.$and.push({
            createdAt: { $gte: new Date(dateFrom) },
          });
        }

        if (dateTo) {
          query.$and.push({
            createdAt: { $lt: dateTo ? new Date(dateTo) : new Date() },
          });
        }

        if (origin) {
          query.$and.push({
            fromPos: { $exists: origin === 'pos' },
          });
        }

        if (customerId) {
          query.$and.push({
            'contact._id': customerId,
          });
        }

        if (marketArea) {
          query.$and.push({
            'staff.marketArea': marketArea,
          });
        }

        return db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            { $project: { _id: 1 } },
            {
              $sort: {
                updatedAt: -1,
              },
            },
          ])
          .toArray()
          .then(orders => {
            const ordersWithProductsPromises: any = [];

            orders.forEach(order => {
              ordersWithProductsPromises.push(
                loadOrderWithProducts(context, { _id: order._id }).then(_order => {
                  const memberDiscount = _order?.payment?.memberTotalDiscount
                    ? Number(_order?.payment?.memberTotalDiscount)
                    : undefined;

                  const totalPrice = Number(_order?.payment?.subTotal);

                  return {
                    ..._order,
                    items: _order.items.map(item => {
                      const purchasedPrice = Number(item.purchasedPrice);
                      const ratio = totalPrice
                        ? purchasedPrice / totalPrice
                        : purchasedPrice;

                      const multiplyRatio =
                        memberDiscount && ratio ? memberDiscount * ratio : false;

                      const unitPriceWithDiscount = multiplyRatio
                        ? purchasedPrice - multiplyRatio
                        : purchasedPrice;

                      return {
                        ...item,
                        unitPriceWithDiscount,
                        discountApplied: unitPriceWithDiscount
                          ? ((purchasedPrice - unitPriceWithDiscount) / purchasedPrice) *
                            100
                          : 0,
                      };
                    }),
                  };
                })
              );
            });

            return Promise.all(ordersWithProductsPromises).then(orders => orders);
          })
          .then(orders => {
            const headers = [
              'CODE',
              'PRODUCT NAME',
              'PRICE',
              'SOLD',
              'REVENUE(S)',
              'DISCOUNT',
              'SOURCE',
              'DINER',
              'ORDER ID',
              'DISPATCH',
            ];

            res.setHeader(
              'Content-disposition',
              'attachment; filename=Product-sales.csv'
            );
            res.set('Content-Type', 'text/csv');

            const csvStream = csv.format({ headers });

            orders.forEach((order: any) => {
              order.items.forEach((item: any) => {
                csvStream.write([
                  item.product?.productCode,
                  item.product?.name,
                  item.product?.price / 100,
                  item.quantity,
                  item.quantity * (item.unitPriceWithDiscount / 100),
                  item.discountApplied,
                  order.fromPos ? 'POS' : 'Web',
                  order.isDiner ? 'Yes' : 'No',
                  order._id,
                  order.dispatchedStatus === 'dispatched' ? 'Yes' : 'No',
                ]);
              });
            });

            csvStream.end();
            csvStream.pipe(res);
          });
      });
    });
  });
  return router;
};
