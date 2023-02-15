import { HttpModule } from '../HttpModule';

import assert from 'assert';
import { Member, Order } from './Models/Order';
import { Contact } from '../contact/Models/Contact';

const createOrderWithMember: HttpModule<
  { memberId: string; orderId?: string | undefined },
  Order
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $database, createEvent }, { memberId, orderId }) {
    assert(!orderId, 'Order Id is not required.');
    assert(memberId, 'A member id is required');

    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Member>('members', memberId || '').then(member => {
        return document
          .fetch<Contact>('contacts', member.contactId || '')
          .then(contact => {
            const order = {
              _id: $id.newId(),
              items: [],
              checkoutStatus: 'pending',
              memberId: memberId,
              contact: {
                _id: contact._id,
                email: contact.email || '',
              },
            } as Order;

            const events = [
              createEvent('CreatedOrder', order),
              createEvent('AddedMemberToOrder', { memberId, orderId }),
              createEvent('AddedContactToOrder', { contactId: contact._id, orderId }),
            ] as any[];

            return startTransaction(session => {
              return document.saveWithEvents('orders', order, events, { session });
            }).then(() => order);
          });
      });
    });
  },
};

export default createOrderWithMember;
