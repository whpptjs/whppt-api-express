import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';
import * as validations from './Validations';
import { Secure } from '../staff/Secure';

const cancelOverrideTotalPrice: HttpModule<{ orderId: string }, void> = {
  exec(context, { orderId }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');

    return $database
      .then(({ document, startTransaction }) => {
        return document.fetch<Order>('orders', orderId).then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          validations.canBeModified(loadedOrder);

          const events = [] as any[];

          if (!loadedOrder?.overrides?.total) return;

          events.push(
            createEvent('OrderTotalPriceOverideCancelled', {
              _id: loadedOrder._id,
            })
          );
          loadedOrder.overrides = undefined;

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, events, {
              session,
            });
          });
        });
      })
      .then(() => {});
  },
};

export default Secure(cancelOverrideTotalPrice);
