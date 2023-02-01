import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import { loadOrder } from './Queries/loadOrder';
import assert from 'assert';
import { assign } from 'lodash';

const markOrderAsPointOfSale: HttpModule<{ orderId: string }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId }) {
    assert(orderId, 'An Order id is required');

    return loadOrder(context, orderId).then(loadedOrder => {
      assert(loadedOrder, 'Order not found.');

      if (!loadedOrder._id)
        return Promise.reject({ status: 404, message: 'Order not found' });

      assign(loadedOrder, {
        ...loadedOrder,
        fromPos: true,
      });

      const events = [context.createEvent('MarkedOrderAsPos', loadedOrder)];

      return context.$database.then(database => {
        const { document, startTransaction } = database;

        return startTransaction(session => {
          return document.saveWithEvents('orders', loadedOrder, events, { session });
        });
      });
    });
  },
};

export default markOrderAsPointOfSale;
