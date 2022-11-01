import assert from 'assert';
import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { Order } from '../order/Models/Order';

const listPreviousOrders: HttpModule<{ memberId: string }, Order[]> = {
  exec({ $database }, { memberId }) {
    const orderStatuses = ['paid', 'completed'];
    assert(memberId, 'A memberId is required');

    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('orders')
        .find<Order>({ memberId, orderStatus: { $in: orderStatuses } })
        .project({ header: 1, updatedAt: 1, _id: 1, orderStatus: 1, total: 1 })
        .toArray()
        .then(orders => {
          return orders as Order[];
        });
    });
  },
};

export default listPreviousOrders;
