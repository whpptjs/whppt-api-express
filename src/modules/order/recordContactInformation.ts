import assert from 'assert';
import { assign } from 'lodash';
import { Contact } from '../contact/Models/Contact';
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
          const _filter = contact._id ? { _id: contact._id } : { email: contact.email };

          return document
            .query<Contact>('contacts', { filter: _filter })
            .then(loadedContact => {
              assert(loadedOrder, 'Order not found.');

              validations.canBeModified(loadedOrder);

              if (detailsHaveNotChanged(loadedOrder, contact)) return;
              const contactToUse = loadedContact
                ? {
                    email: loadedContact.email,
                    firstName: loadedContact.firstName,
                    lastName: loadedContact.lastName,
                    _id: loadedContact._id,
                  }
                : {
                    _id: context.$id.newId(),
                    firstName: contact?.firstName || 'Guest',
                    lastName: contact?.lastName || 'Website',
                    ...contact,
                  };

              const event = createEvent('OrderContactInformationUpdated', {
                _id: loadedOrder._id,
                contact: contactToUse,
              });

              assign(loadedOrder, {
                ...loadedOrder,
                contact: contactToUse,
              });

              return startTransaction(session => {
                return document
                  .saveWithEvents('orders', loadedOrder, [event], {
                    session,
                  })
                  .then(() => {
                    if (contact._id) return;

                    const contactEvents = [createEvent('ContactCreated', contactToUse)];

                    return document.saveWithEvents(
                      'contacts',
                      contactToUse,
                      contactEvents,
                      {
                        session,
                      }
                    );
                  });
              });
            });
        });
    });
  },
};

const detailsHaveNotChanged = (order: Order, contact: OrderContact) => {
  return order.contact?.email === contact.email && order.contact?._id === contact._id;
};

export default recordContactInformation;
