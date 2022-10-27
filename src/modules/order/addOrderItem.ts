import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';

const addOrderItem: HttpModule<
  { productId: string; orderId: string; quantity: number },
  Order | void
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $database, createEvent, $id }, { productId, orderId, quantity }) {
    assert(orderId, 'Order Id is required.');
    assert(productId, 'Product Id is required.');

    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Order>('orders', { filter: { _id: orderId } })
        .then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          const events = [] as any[];
          assert(
            !loadedOrder.items.find(i => i.productId === productId),
            'Product already on order.'
          );

          const orderItemId = $id.newId();
          loadedOrder.items.push({ productId, quantity, _id: orderItemId });

          events.push(
            createEvent('OrderItemAddedToOrder', {
              _id: loadedOrder._id,
              productId,
              quantity,
              orderItemId,
            })
          );

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, events, { session });
          }).then(() => loadedOrder);
        });
    });
  },
};

export default addOrderItem;
