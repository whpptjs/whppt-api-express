import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';

const removeOrderItem: HttpModule<{ orderItemId: string; orderId: string }, void> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $database, createEvent }, { orderItemId, orderId }) {
    assert(orderId, 'Order Id is required.');
    assert(orderItemId, 'Order Item Id is required.');

    return $database
      .then(({ document, startTransaction }) => {
        return document
          .query<Order>('orders', { filter: { _id: orderId } })
          .then(loadedOrder => {
            assert(loadedOrder, 'Order not found.');
            assert(loadedOrder.checkoutStatus === 'pending', 'Order already completed.');

            const events = [] as any[];

            assert(
              loadedOrder.items.filter(i => i._id === orderItemId),
              'Order Item was not found on order.'
            );

            loadedOrder.items = loadedOrder.items.filter(i => {
              return i._id !== orderItemId;
            });
            events.push(
              createEvent('OrderItemRemovedFromOrder', {
                _id: loadedOrder._id,
                orderItemId,
              })
            );

            return startTransaction(session => {
              return document.saveWithEvents('orders', loadedOrder, events, { session });
            });
          });
      })
      .then(() => {});
  },
};

export default removeOrderItem;
