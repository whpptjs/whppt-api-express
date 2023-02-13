import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';

const listReadyToDispatch: HttpModule<{ currentPage: string; size: string }, Order[]> = {
  exec({ $database }, { currentPage = '1', size = '100' }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      return db
        .collection('orders')
        .aggregate<Order>([
          {
            $match: {
              checkoutStatus: 'paid',
              'payment.status': 'paid',
              'shipping.pickup': { $ne: true },
            },
          },
          {
            $sort: {
              'payment.date': -1,
            },
          },
          {
            $skip: parseInt(size) * parseInt(currentPage),
          },
          {
            $limit: parseInt(size),
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.date' } },
              orders: { $push: '$$ROOT' },
            },
          },
        ])
        .toArray()
        .then(orders => orders);
    });
  },
};

export default Secure(listReadyToDispatch);
