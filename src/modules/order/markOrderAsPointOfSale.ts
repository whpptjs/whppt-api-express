import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import { loadOrder } from './Queries/loadOrder';
import assert from 'assert';
import { assign } from 'lodash';
import { Staff } from '../staff/Model';

const markOrderAsPointOfSale: HttpModule<{ orderId: string; staffId: string }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId, staffId }) {
    assert(orderId, 'An Order id is required');

    return context.$database.then(database => {
      const { document, startTransaction } = database;

      return loadOrder(context, orderId).then(loadedOrder => {
        return document
          .query<Staff>('staff', { filter: { _id: staffId } })
          .then(staff => {
            assert(loadedOrder, 'Order not found.');

            if (!loadedOrder._id)
              return Promise.reject({ status: 404, message: 'Order not found' });

            assign(loadedOrder, {
              ...loadedOrder,
              fromPos: true,
              staff: {
                _id: staff && staff._id,
                marketArea: staff && staff.marketArea,
              },
            });

            const events = [context.createEvent('MarkedOrderAsPos', loadedOrder)];

            return startTransaction(session => {
              return document.saveWithEvents('orders', loadedOrder, events, { session });
            });
          });
      });
    });
  },
};

export default markOrderAsPointOfSale;
