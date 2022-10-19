import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

export type ChangeOrderInfoArgs = {
  orderId: string;
  information: {
    email: string;
  };
};

const continueToPayment: HttpModule<ChangeOrderInfoArgs, void> = {
  exec({ $database, createEvent }, { orderId, information }) {
    assert(orderId, 'Order Id is required.');
    assert(information.email, 'email is required.');

    return $database
      .then(({ document, startTransaction }) => {
        return document
          .query<Order>('orders', { filter: { _id: orderId } })
          .then(loadedOrder => {
            assert(loadedOrder, 'Order not found.');
            if (loadedOrder.email === information.email) return {};

            const event = createEvent('OrderInformationUpdated', {
              _id: loadedOrder._id,
              information,
            });

            return startTransaction(session => {
              return document.saveWithEvents('orders', loadedOrder, [event], { session });
            });
          });
      })
      .then(() => {});
  },
};

export default continueToPayment;
