import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

export type RecordOrderInfoArgs = {
  orderId: string;
  contactId?: string;
  contactRecord: {
    email: string;
  };
};

const recordContactInfo: HttpModule<RecordOrderInfoArgs, Order> = {
  exec(context, { orderId, contactRecord, contactId }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    assert(contactRecord.email, 'email is required.');

    return $database.then(({ document, startTransaction }) => {
      const contactQuery = contactId
        ? { _id: contactId }
        : ({ email: contactRecord.email } as { email?: string; _id?: string });

      return Promise.all([
        document.query<Order>('orders', { filter: { _id: orderId } }),
        document.query<Order>('contacts', { filter: contactQuery }),
      ]).then(([loadedOrder, contactInMongo]) => {
        assert(loadedOrder, 'Order not found.');
        assert(loadedOrder.checkoutStatus !== 'paid', 'Order already completed.');

        const contact = contactInMongo || {
          _id: context.$id.newId(),
          email: contactRecord.email,
        };

        if (
          loadedOrder.contactRecord?.email === contactRecord.email &&
          contact._id === loadedOrder.contactId
        )
          return loadedOrder;

        const event = createEvent('OrderContactInformationUpdated', {
          _id: loadedOrder._id,
          contactRecord,
          contactId: contact._id,
        });

        assign(loadedOrder, {
          ...loadedOrder,
          contactId: contact._id,
          contactRecord: {
            ...loadedOrder.contactRecord,
            ...contactRecord,
          },
        });

        return startTransaction(session => {
          return document
            .saveWithEvents('orders', loadedOrder, [event], { session })
            .then(() => {
              if (contactInMongo) return;

              const contactEvents = createEvent('CreatedContact', contact);
              return document.saveWithEvents('contacts', contact, [contactEvents], {
                session,
              });
            });
        }).then(() => loadedOrder);
      });
    });
  },
};

export default recordContactInfo;
