import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';

const changeOrderItemQuantity: HttpModule<
  { orderItemId: string; quantity: number; orderId?: string | undefined },
  void
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $database, createEvent }, { orderItemId, quantity, orderId }) {
    assert(orderId, 'Order Id is required.');
    assert(orderItemId, 'Order Item Id is required.');
    assert(quantity, 'Product quantity is required.');
    const quantityAsNumber = Number(quantity);
    assert(quantityAsNumber > 0, 'Product quantity must be higher than 0.');

    return $database
      .then(({ document, startTransaction }) => {
        return document
          .query<Order>('orders', { filter: { _id: orderId } })
          .then(loadedOrder => {
            const order = {
              ...loadedOrder,
              _id: (loadedOrder && loadedOrder._id) || $id.newId(),
              items: (loadedOrder && loadedOrder.items) || [],
            } as Order;

            const events = [] as any[];

            const productAlreadyOnOrder = order.items.find(i => i._id === orderItemId);
            assert(productAlreadyOnOrder, 'Order Item not found on Order');

            if (productAlreadyOnOrder.quantity < quantityAsNumber) {
              events.push(
                createEvent('OrderItemQuantityIncreased', {
                  _id: order._id,
                  productOrderId: productAlreadyOnOrder._id,
                  productId: productAlreadyOnOrder.productId,
                  quantity: quantityAsNumber,
                  previousQuantity: productAlreadyOnOrder.quantity,
                })
              );
              productAlreadyOnOrder.quantity = quantityAsNumber;
            } else if (productAlreadyOnOrder.quantity > quantityAsNumber) {
              events.push(
                createEvent('OrderItemQuantityReduced', {
                  _id: order._id,
                  productOrderId: productAlreadyOnOrder._id,
                  productId: productAlreadyOnOrder.productId,
                  quantity: quantityAsNumber,
                  previousQuantity: productAlreadyOnOrder.quantity,
                })
              );
              productAlreadyOnOrder.quantity = quantityAsNumber;
            }

            if (events.length === 0) return order;

            return startTransaction(session => {
              return document.saveWithEvents('orders', order, events, { session });
            });
          });
      })
      .then(() => {});
  },
};

export default changeOrderItemQuantity;
