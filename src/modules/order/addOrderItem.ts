import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';
import * as validations from './Validations';

const addOrderItem: HttpModule<
  { productId: string; orderId: string; quantity: number },
  void
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $database, createEvent, $id }, { productId, orderId, quantity }) {
    assert(orderId, 'Order Id is required.');
    assert(productId, 'Product Id is required.');

    return $database
      .then(({ document, startTransaction }) => {
        return document
          .query<Order>('orders', { filter: { _id: orderId } })
          .then(loadedOrder => {
            assert(loadedOrder, 'Order not found.');
            validations.canBeModified(loadedOrder);
            assert(
              !loadedOrder.items.find(i => i.productId === productId),
              'Product already on order.'
            );

            const events = [] as any[];

            loadedOrder.items.push({ productId, quantity, _id: $id.newId() });

            events.push(
              createEvent('OrderItemAddedToOrder', {
                _id: loadedOrder._id,
                productId,
                quantity,
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

export default addOrderItem;
