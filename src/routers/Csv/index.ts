import { Router } from 'express';
import { WhpptRequest } from 'src';
import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Order } from '../../modules/order/Models/Order';
import * as csv from 'fast-csv';
import { loadOrderWithProducts } from '../../modules/order/Queries/loadOrderWithProducts';
import { addUnitDiscountsToOrder } from '../../modules/order/Helpers/AddUnitDiscounts';

const router = Router();

export const CsvRouter = (apiPrefix: string) => {
  router.get(`/${apiPrefix}/csv/productSales`, (req: any, res: any) => {
    return (req as WhpptRequest).moduleContext
      .then(context => {
        return context.$database.then(database => {
          const { db } = database as WhpptMongoDatabase;
          const {
            dateFromYear,
            dateFromMonth,
            dateFromDay,
            dateToYear,
            dateToMonth,
            dateToDay,
            origin,
            marketArea,
            customerId,
          } = req.query;

          const query = {
            $and: [{ _id: { $exists: true }, checkoutStatus: 'paid' }],
          } as any;

          if (dateFromYear && dateFromMonth && dateFromDay) {
            query.$and.push({
              'payment.date': {
                $gte: new Date(dateFromYear, dateFromMonth, dateFromDay, 0, 0, 0, 0),
              },
            });
          }

          if (dateToYear && dateToMonth && dateToDay) {
            query.$and.push({
              'payment.date': {
                $lt: new Date(dateToYear, dateToMonth, dateToDay, 0, 0, 0, 0),
              },
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
                    return addUnitDiscountsToOrder(_order);
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
                'TOTAL DISCOUNT %',
                '# SOLD',
                'REVENUE(S)',
                'SOURCE',
                'DINER',
                'ORDER #',
                'DISPATCH',
                'SHIPPING PRICE',
              ];

              res.setHeader(
                'Content-disposition',
                'attachment; filename=Product-sales.csv'
              );
              res.type('Content-Type', 'text/csv');

              const csvStream = csv.format({ headers });

              orders.forEach((order: any) => {
                order.items.forEach((item: any) => {
                  csvStream.write([
                    item.product?.productCode,
                    item.product?.name,
                    item.originalPrice / 100,
                    item.totalDiscountApplied,
                    item.quantity,
                    item.revenue / 100,
                    order.fromPos ? 'POS' : 'Web',
                    order.isDiner ? 'Yes' : 'No',
                    order.orderNumber || order._id,
                    order.shipping?.pickup ? 'No' : 'Yes',
                    item.shippingCostPrice / 100,
                  ]);
                });
              });

              csvStream.end();
              csvStream.pipe(res);
            });
        });
      })
      .catch(err => {
        console.log('🚀  err csv:', err);
        return res.status(500).send(err);
      });
  });
  return router;
};
