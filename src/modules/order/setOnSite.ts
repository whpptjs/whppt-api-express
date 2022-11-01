import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

export type ChangeOrderSetOnSite = {
  orderId: string;
  setOnSite: boolean;
};

const setOnSite: HttpModule<ChangeOrderSetOnSite, Order> = {
  exec(context, { orderId, setOnSite }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');

    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Order>('orders', { filter: { _id: orderId } })
        .then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          assert(loadedOrder.orderStatus, 'Order already completed.');

          const event = createEvent('OrderBillingDetailsUpdated', {
            _id: loadedOrder._id,
            setOnSite,
          });

          assign(loadedOrder, {
            ...loadedOrder,
            setOnSite,
          });

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, [event], { session });
          }).then(() => loadedOrder);
        });
    });
  },
};

export default setOnSite;
