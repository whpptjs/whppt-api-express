import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Order } from '../order/Models/Order';
import { Secure } from './Secure';

export type ListOrdersRetured = {
  orders: any[];
  total: number;
};

const listSales: HttpModule<
  {
    limit: string;
    dateFrom: string;
    dateTo: string;
    currentPage: string;
    origin?: string;
    staffId?: string;
    status: 'paid';
  },
  ListOrdersRetured
> = {
  exec(
    { $database },
    {
      dateFrom,
      dateTo,
      limit = '10',
      currentPage = '0',
      origin,
      staffId,
      status = 'paid',
    }
  ) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {
        $and: [
          { _id: { $exists: true } },
          { checkoutStatus: status ? status : { $exists: true } },
        ],
      } as any;

      if (staffId) {
        query.$and.push({
          staffId,
        });
      }

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

      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            {
              $sort: {
                updatedAt: -1,
              },
            },
            {
              $project: {
                member: 0,
              },
            },
            {
              $skip: parseInt(limit) * parseInt(currentPage),
            },
            {
              $limit: parseInt(limit),
            },
          ])
          .toArray(),
        db.collection('orders').countDocuments(query),
        db
          .collection('orders')
          .aggregate([
            {
              $match: {
                checkoutStatus: 'paid',
              },
            },
            {
              $group: {
                _id: null,
                salesTotal: { $sum: '$payment.amount' },
                itemsTotal: {
                  $sum: '$items.quantity',
                },
              },
            },
          ])
          .toArray(),
      ]).then(([orders, total = 0, [{ salesTotal, itemsTotal }]]) => {
        return { orders, total, salesTotal, itemsTotal };
      });
    });
  },
};

export default Secure(listSales);
