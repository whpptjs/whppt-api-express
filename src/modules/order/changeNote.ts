import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';
import { assign } from 'lodash';

const changeNote: HttpModule<{ note: string; orderId: string }, void> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $database, createEvent }, { note, orderId }) {
    assert(orderId, 'Order Id is required.');

    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Order>('orders', orderId).then(loadedOrder => {
        assert(loadedOrder, 'Order not found.');

        const events = [
          createEvent('ChangedOrderNote', {
            _id: loadedOrder._id,
            note,
            from: loadedOrder.note,
          }),
        ];

        assign(loadedOrder, { note });

        return startTransaction(session => {
          return document.saveWithEvents('orders', loadedOrder, events, { session });
        });
      });
    });
  },
};

export default changeNote;
