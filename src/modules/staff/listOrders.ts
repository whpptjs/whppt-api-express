import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';

export type ListOrdersRetured = {
  statuses: { _id: string; amount: number }[];
};

const listOrders: HttpModule<
  { searchBy: string; size: string; page: string; status: string },
  ListOrdersRetured
> = {
  exec({ $database }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      return db
        .collection('orders')
        .aggregate([
          {
            $group: {
              _id: '$checkoutStatus',
              amount: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray()
        .then(statuses => {
          return {
            statuses,
          } as ListOrdersRetured;
        });
    });
  },
};

export default listOrders;
