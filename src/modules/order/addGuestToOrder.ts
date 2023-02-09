import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import { loadOrder } from './Queries/loadOrder';
import assert from 'assert';
import { assign } from 'lodash';
import { createContactAndPublish } from '../contact/Common/CreateContact';
import { Contact } from '../contact/Models/Contact';

const addGuestToOrder: HttpModule<{ orderId: string }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(context, { orderId }) {
    assert(orderId, 'An Order id is required');

    return loadOrder(context, orderId).then(loadedOrder => {
      assert(loadedOrder, 'Order not found.');
      return context.$database.then(database => {
        const { document } = database;

        return document
          .query<Contact>('contacts', { filter: { _id: 'unknown_guest' } })
          .then(loadedContact => {
            const guestContact = loadedContact || {
              _id: 'unknown_guest',
              name: 'Unknown Guest',
              firstName: 'Unknown',
              lastName: 'Guest',
            };

            assign(loadedOrder, {
              ...loadedOrder,
              contact: guestContact,
            });

            const events = [context.createEvent('GuestAddedToOrder', { guestContact })];

            return context.$database.then(database => {
              const { document, startTransaction } = database;

              return startTransaction(session => {
                return document
                  .saveWithEvents('orders', loadedOrder, events, { session })
                  .then(() => {
                    if (loadedContact) return;

                    return createContactAndPublish(
                      { ...context, document },
                      guestContact,
                      session
                    );
                  });
              });
            });
          });
      });
    });
  },
};

export default addGuestToOrder;
