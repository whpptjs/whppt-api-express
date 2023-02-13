import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Secure } from '../staff/Secure';

const listReadyToDispatch: HttpModule<{}> = {
  exec({ $database }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      return db
        .collection('orders')
        .aggregate([
          {
            $match: {
              checkoutStatus: 'paid',
              'shipping.pickup': { $ne: true },
            },
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
