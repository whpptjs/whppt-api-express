import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

export type OrderRecordContactInformationArgs = {
  orderId: string;
  contact: {
    _id?: string;
    email: string;
  };
};

const recordContactInformation: HttpModule<OrderRecordContactInformationArgs, void> = {
  exec(context, { orderId, contact }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    assert(contact.email, 'email is required.');

    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Order>('orders', { filter: { _id: orderId } })
        .then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          if (
            loadedOrder.contact?.email === contact.email &&
            loadedOrder.contact?._id === contact._id
          )
            return;

          assert(loadedOrder.checkoutStatus === 'pending', 'Order already completed.');

          const event = createEvent('OrderContactInformationUpdated', {
            _id: loadedOrder._id,
            contact,
          });

          assign(loadedOrder, {
            ...loadedOrder,
            contact: {
              ...loadedOrder.contact,
              ...contact,
            },
          });

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, [event], { session });
          });
        });
    });
  },
};

export default recordContactInformation;
