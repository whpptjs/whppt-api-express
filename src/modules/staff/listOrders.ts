import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Order } from '../order/Models/Order';
import { Secure } from './Secure';

export type ListOrdersRetured = {
  orders: any[];
  total: number;
};

const listOrders: HttpModule<
  {
    search: string;
    limit: string;
    dateFrom: string;
    dateTo: string;
    currentPage: string;
    status: string;
  },
  ListOrdersRetured
> = {
  exec(
    { $database },
    { search, dateFrom, dateTo, limit = '10', currentPage = '0', status }
  ) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {
        $and: [
          { _id: { $exists: true } },
          { checkoutStatus: status ? status : { $ne: 'pending' } },
        ],
      } as any;

      if (search && search !== 'undefined') {
        query.$and.push({
          $or: [
            {
              _id: {
                $regex: search,
              },
            },
            {
              orderNumber: {
                $regex: search,
              },
            },
          ],
        });
      }
      if (dateFrom) {
        query.$and.push({
          createdAt: { $gte: new Date(dateFrom) },
        });
      }
      if (dateTo) {
        query.$and.push({
          createdAt: { $lt: new Date(dateTo) },
        });
      }

      //TODO Some reason unwind is limiting results/
      console.log('🚀 ~ file: listOrders.ts:71 ~ query', query);
      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            // {
            //   $lookup: {
            //     from: 'member',
            //     localField: 'memberId',
            //     foreignField: '_id',
            //     as: 'member',
            //   },
            // },
            // {
            //   $unwind: {
            //     path: '$member',
            //   },
            // },
            // {
            //   $lookup: {
            //     from: 'contacts',
            //     localField: 'member.contactId',
            //     foreignField: '_id',
            //     as: 'contact',
            //   },
            // },
            // {
            //   $unwind: {
            //     path: '$contact',
            //   },
            // },
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
      ]).then(([orders, total = 0]) => {
        return {
          orders: orders.map(order => ({
            ...order,
            contact: {
              _id: order?.contact?._id,
              firstName: order?.contact?.firstName,
              lastName: order?.contact?.lastName,
              email: order?.contact?.email,
            },
          })),
          total,
        };
      });
    });
  },
};

export default Secure(listOrders);
