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
    paymentType?: string;
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
      paymentType,
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
          'staff._id': staffId,
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
      if (paymentType) {
        query.$and.push({
          'payment.type': paymentType,
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
          .aggregate<any>([
            {
              $match: query,
            },
            {
              $project: {
                paymentAmount: '$payment.subTotal',
                quantities: '$items.quantity',
              },
            },
            {
              $unwind: {
                path: '$quantities',
              },
            },
            {
              $group: {
                _id: null,
                salesTotal: {
                  $sum: '$paymentAmount',
                },
                itemsTotal: {
                  $sum: {
                    $add: '$quantities',
                  },
                },
              },
            },
          ])
          .toArray(),
      ]).then(([orders, total = 0, amounts]) => {
        const { salesTotal = 0, itemsTotal = 0 } = amounts[0] || {};
        return { orders, total, salesTotal, itemsTotal };
      });
    });
  },
};

export default Secure(listSales);
