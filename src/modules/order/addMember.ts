import assert from 'assert';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Member, Order, OrderContact } from './Models/Order';
import * as validations from './Validations';

const addMember: HttpModule<
  { memberId: string; orderId: string },
  { memberId: string; contact: OrderContact | undefined }
> = {
  exec({ $database, createEvent }, { memberId, orderId }) {
    assert(memberId, 'A member id is required');
    assert(orderId, 'An Order id is required');

    return $database.then(database => {
      const { document, startTransaction } = database;
      return document.fetch<Order>('orders', orderId).then(order => {
        validations.canBeModified(order);
        if (order.memberId === memberId) return { memberId, contact: order.contact };
        assert(!order.memberId, 'A member has already been assigned to the order.');
        return document
          .fetch<Member>('members', memberId || '')
          .then(member => {
            return document
              .fetch<Contact>('contacts', member.contactId || '')
              .then(contact => {
                const events = [
                  createEvent('AddedMemberToOrder', { memberId, orderId }),
                  createEvent('AddedContactToOrder', { contactId: contact._id, orderId }),
                ];

                order.memberId = memberId;

                order.contact = {
                  _id: contact._id || order?.contact?._id,
                  email: contact.email || order?.contact?.email || '',
                };

                return startTransaction(session => {
                  return document.saveWithEvents('orders', order, events, { session });
                });
              });
          })
          .then(() => ({ memberId, contact: order.contact }));
      });
    });
  },
};

export default addMember;
