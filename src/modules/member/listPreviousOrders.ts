import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Order } from '../order/Models/Order';

const listPreviousOrders: HttpModule<{ memberId: string }, Order[]> = {
  exec({ $database }, { memberId }) {
    assert(memberId, 'A memberId is required');

    return $database.then(({ queryDocuments }) => {
      return queryDocuments<Order>('orders', {
        filter: { memberId, checkoutStatus: { $ne: 'pending' } },
        sort: { updatedAt: -1 },
      });
    });
  },
};

export default listPreviousOrders;
