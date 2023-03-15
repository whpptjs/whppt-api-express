import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Order } from './Models/Order';
import * as validations from './Validations';
import { Secure } from '../staff/Secure';

const changeItemPrice: HttpModule<{ overidedPrice: number; orderId: string }, void> = {
  exec(context, { overidedPrice, orderId }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    assert(overidedPrice || overidedPrice === 0, 'Override price is required.');

    const overidedPriceAsNumber = Number(overidedPrice);
    assert(overidedPriceAsNumber >= 0, 'Product Price must be 0 or higher.');

    return $database
      .then(({ document, startTransaction }) => {
        return document.fetch<Order>('orders', orderId).then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          validations.canBeModified(loadedOrder);

          const events = [] as any[];

          if (overidedPriceAsNumber === loadedOrder?.overrides?.total) return;

          events.push(
            createEvent('OrderTotalPriceOverided', {
              _id: loadedOrder._id,
              overidedPrice,
            })
          );
          loadedOrder.overrides = {
            ...(loadedOrder.overrides || {}),
            total: overidedPriceAsNumber,
          };

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

export default Secure(changeItemPrice);
