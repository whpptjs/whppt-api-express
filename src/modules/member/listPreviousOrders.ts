import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Order } from '../order/Models/Order';

const listPreviousOrders: HttpModule<
  { memberId: string; currentPage: string; limit: string },
  { orders: Order[]; total: number }
> = {
  exec({ $database }, { memberId, currentPage, limit }) {
    assert(memberId, 'A memberId is required');
    const numLimit = Number(limit);
    const numCurrentPage = Number(currentPage);
    const query = { memberId, checkoutStatus: { $ne: 'pending' } };

    return $database.then(({ queryDocuments, countDocuments }) => {
      return Promise.all([
        queryDocuments<Order>('orders', {
          filter: query,
          sort: { updatedAt: -1 },
          limit: numLimit,
          skip: numLimit * numCurrentPage,
        }),
        countDocuments('orders', { filter: query }),
      ]).then(([orders, total]) => {
        return { orders, total };
      });
    });
  },
};

export default listPreviousOrders;
