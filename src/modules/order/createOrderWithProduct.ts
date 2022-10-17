import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';

const createOrderWithProduct: HttpModule<
  { productId: string; quantity: number; orderId?: string | undefined },
  Order
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $database, createEvent }, { productId, quantity, orderId }) {
    assert(!orderId, 'Order Id is not required.');
    assert(productId, 'Product Id is required.');
    assert(quantity, 'Product quantity is required.');
    const quantityAsNumber = Number(quantity);
    assert(quantityAsNumber > 0, 'Product quantity must be higher than 0.');
    return $database.then(({ document, startTransaction }) => {
      const order = {
        _id: $id.newId(),
        items: [],
        orderStatus: 'pending',
      } as Order;

      const events = [] as any[];

      events.push(createEvent('CreatedOrder', order));
      const orderItem = { _id: $id.newId(), productId, quantity: quantityAsNumber };
      events.push(createEvent('OrderItemAddedToOrder', { _id: order._id, orderItem }));
      Object.assign(order.items, [orderItem]);

      return startTransaction(session => {
        return document.saveWithEvents('orders', order, events, { session });
      }).then(() => order);
    });
  },
};

export default createOrderWithProduct;
