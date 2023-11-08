import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Member, Order } from './Models/Order';
import { Contact } from '../contact/Models/Contact';
import { getNewOrderNumber } from './Queries/getNewOrderNumber';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

const createOrderWithMember: HttpModule<
  { memberId: string; orderId?: string | undefined; fromPos?: boolean },
  Order
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $database, createEvent }, { memberId, orderId, fromPos = false }) {
    assert(!orderId, 'Order Id is not required.');
    assert(memberId, 'A member id is required');

    return $database.then(database => {
      const { db, document, startTransaction } = database as WhpptMongoDatabase;

      return document.fetch<Member>('members', memberId || '').then(member => {
        return document
          .fetch<Contact>('contacts', member.contactId || '')
          .then(contact => {
            const order = {
              _id: $id.newId(),
              items: [],
              checkoutStatus: 'pending',
              memberId: memberId,
              fromPos,
              contact: {
                _id: contact._id,
                email: contact.email || '',
              },
            } as Order;
            return startTransaction(session => {
              return getNewOrderNumber(db).then(orderNumber => {
                order.orderNumber = orderNumber;
                const events = [
                  createEvent('CreatedOrder', order),
                  createEvent('AddedMemberToOrder', { memberId, orderId }),
                  createEvent('AddedContactToOrder', {
                    contactId: contact._id,
                    orderId,
                  }),
                ] as any[];
                return document.saveWithEvents('orders', order, events, { session });
              });
            }).then(() => order);
          });
      });
    });
  },
};

export default createOrderWithMember;
