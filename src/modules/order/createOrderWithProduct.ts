import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';
import { getNewOrderNumber } from './Queries/getNewOrderNumber';
import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Product } from '../product/Models/Product';
import * as validations from './Validations';

const createOrderWithProduct: HttpModule<
  {
    productId: string;
    quantity: number;
    orderId?: string | undefined;
    fromPos?: boolean;
    fromWebsite?: boolean;
  },
  Order
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(
    { $id, $database, createEvent },
    { productId, quantity, orderId, fromPos = false, fromWebsite = false }
  ) {
    assert(!orderId, 'Order Id is not required.');
    assert(productId, 'Product Id is required.');
    assert(quantity, 'Product quantity is required.');
    const quantityAsNumber = Number(quantity);
    assert(quantityAsNumber > 0, 'Product quantity must be higher than 0.');
    return $database.then(database => {
      const { db, document, startTransaction } = database as WhpptMongoDatabase;
      return document
        .query<Product>('products', { filter: { _id: productId } })
        .then(product => {
          assert(product, 'Product not found.');
          validations.productAvailbleForSale({ product, fromWebsite });
          const order = {
            _id: $id.newId(),
            items: [],
            checkoutStatus: 'pending',
            fromPos,
          } as Order;

          const events = [] as any[];

          const orderItem = { _id: $id.newId(), productId, quantity: quantityAsNumber };
          Object.assign(order.items, [orderItem]);

          return startTransaction(session => {
            return getNewOrderNumber(db).then(orderNumber => {
              order.orderNumber = orderNumber;
              events.push(createEvent('CreatedOrder', order));
              events.push(
                createEvent('OrderItemAddedToOrder', { _id: order._id, orderItem })
              );
              return document.saveWithEvents('orders', order, events, { session });
            });
          }).then(() => order);
        });
    });
  },
};

export default createOrderWithProduct;
