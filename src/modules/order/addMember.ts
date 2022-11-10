import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

const addMember: HttpModule<{ memberId: string; orderId: string }, void> = {
  exec({ $database, createEvent }, { memberId, orderId }) {
    assert(memberId, 'A member id is required');
    assert(orderId, 'An Order id is required');

    return $database.then(database => {
      const { document, startTransaction } = database;
      return document.fetch<Order>('orders', orderId).then(order => {
        if (order.memberId === memberId) return;
        assert(!order.memberId, 'A member has already been assigned to the order.');

        const events = [createEvent('AddedMemberToOrder', { memberId, orderId })];

        order.memberId = memberId;

        return startTransaction(session => {
          return document.saveWithEvents('orders', order, events, { session });
        });
      });
    });
  },
};

export default addMember;
