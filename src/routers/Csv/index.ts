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

        return db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            {
              $lookup: {
                from: 'staff',
                localField: 'staffId',
                foreignField: '_id',
                as: 'staffInfo',
              },
            },
            {
              $match: marketArea ? { 'staffInfo.marketArea': `${marketArea}` } : {},
            },
            {
              $sort: {
                updatedAt: -1,
              },
            },
          ])
          .toArray()
          .then(orders => {
            const ordersWithProducts: any = [];

            orders.forEach(order => {
              ordersWithProducts.push(loadOrderWithProducts(context, { _id: order._id }));
            });

            return Promise.all(ordersWithProducts).then(orders => orders);
          })
          .then(orders => {
            const headers = [
              'PRODUCT NAE',
              'PRICE',
              'SOLD',
              'REVENUE(S)',
              'ONLINE/POS',
              'RESTAURANT DINER',
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
                  item.product?.name,
                  item.product?.price / 100,
                  item.quantity,
                  (item.product?.price / 100) * item.quantity,
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
