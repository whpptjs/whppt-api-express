import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order, OrderContact } from './Models/Order';
import * as validations from './Validations';

export type OrderRecordContactInformationArgs = {
  orderId: string;
  contact: OrderContact;
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

          validations.canBeModified(loadedOrder);

          if (detailsHaveNotChanged(loadedOrder, contact)) return;
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

const detailsHaveNotChanged = (order: Order, contact: OrderContact) => {
  return order.contact?.email === contact.email && order.contact?._id === contact._id;
};

export default recordContactInformation;
