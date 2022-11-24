import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Order } from '../order/Models/Order';

export type ListOrdersRetured = {
  orders: Order[];
  total: number;
};

const listOrders: HttpModule<
  { searchBy: string; limit: string; currentPage: string; status: string },
  ListOrdersRetured
> = {
  exec({ $database }, { searchBy, limit, currentPage, status }) {
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

      return Promise.all([
        db
          .collection('orders')
          .find<Order>(query)
          .skip(parseInt(limit) * parseInt(currentPage))
          .limit(parseInt(limit))
          .toArray(),
        db.collection('orders').countDocuments(query),
      ]).then(([orders, total = 0]) => {
        return { orders, total };
      });
    });
  },
};

export default listOrders;
