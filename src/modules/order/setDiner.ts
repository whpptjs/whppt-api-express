import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';
import { assign } from 'lodash';
import { Secure } from '../staff/Secure';

const setDiner: HttpModule<{ isDiner: boolean; orderId: string }, void> = {
  exec({ $database, createEvent }, { isDiner, orderId }) {
    assert(orderId, 'Order Id is required.');

    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Order>('orders', orderId).then(loadedOrder => {
        assert(loadedOrder, 'Order not found.');

        const events = [
          createEvent(isDiner ? 'OrderFlaggedAsDiner' : 'OrderFlaggedAsNonDiner', {
            _id: loadedOrder._id,
            isDiner,
          }),
        ];

        assign(loadedOrder, { isDiner });

        return startTransaction(session => {
          return document.saveWithEvents('orders', loadedOrder, events, { session });
        });
      });
    });
  },
};

export default Secure(setDiner);
