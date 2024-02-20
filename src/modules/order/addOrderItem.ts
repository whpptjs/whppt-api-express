import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';
import * as validations from './Validations';
import { Product } from '../product/Models/Product';

const addOrderItem: HttpModule<
  {
    productId: string;
    orderId: string;
    quantity: number;
    fromWebsite: boolean;
    maxQuantity?: number;
  },
  void
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(
    { $database, createEvent, $id },
    { productId, orderId, quantity, fromWebsite = false, maxQuantity }
  ) {
    assert(orderId, 'Order Id is required.');
    assert(productId, 'Product Id is required.');

    return $database
      .then(({ document, startTransaction }) => {
        return Promise.all([
          document.query<Order>('orders', { filter: { _id: orderId } }),
          document.query<Product>('products', { filter: { _id: productId } }),
        ]).then(([loadedOrder, product]) => {
          assert(loadedOrder, 'Order not found.');
          assert(product, 'Product not found.');
          validations.canBeModified(loadedOrder);
          validations.productAvailbleForSale({ product, fromWebsite });
          assert(
            !loadedOrder.items.find(i => i.productId === productId),
            'Product already on order.'
          );

          const events = [] as any[];

          loadedOrder.items.push({ productId, quantity, _id: $id.newId(), maxQuantity });

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
