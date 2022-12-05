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
    searchBy: string;
    limit: string;
    currentPage: string;
    status: string;
  },
  ListOrdersRetured
> = {
  exec({ $database }, { searchBy, limit = '10', currentPage = '0', status }) {
    console.log('🚀currentPage', currentPage);
    console.log('🚀  limit', limit);
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {
        $and: [
          { _id: { $exists: true } },
          { checkoutStatus: status ? status : { $ne: 'pending' } },
        ],
      } as any;

      if (searchBy) {
        query.$and.push({
          $or: [
            {
              _id: {
                $regex: searchBy,
              },
            },
            {
              orderNumber: {
                $regex: searchBy,
              },
            },
          ],
        });
      }

      //TODO Some reason unwind is limiting results/
      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            {
              $lookup: {
                from: 'member',
                localField: 'memberId',
                foreignField: '_id',
                as: 'member',
              },
            },
            {
              $unwind: {
                path: '$member',
              },
            },
            {
              $lookup: {
                from: 'contacts',
                localField: 'member.contactId',
                foreignField: '_id',
                as: 'contact',
              },
            },
            {
              $unwind: {
                path: '$contact',
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
