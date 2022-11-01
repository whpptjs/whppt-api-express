import assert from 'assert';
import { assign } from 'lodash';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';

const create: HttpModule<{ contactId: string; username: string; email: string }, Member> =
  {
    exec({ $database, $id, createEvent }, { contactId, username, email }) {
      assert(contactId, 'A contact Id is required');
      assert(username, 'A username is required');

      return $database.then(database => {
        const { document, startTransaction } = database;

        return Promise.all([
          document.query<Contact>('contacts', { filter: { _id: contactId, email } }),
          document.query<Member>('members', { filter: { username } }),
        ]).then(([contact, usedUsername]) => {
          assert(contact, 'Could not find contact.');
          assert(!usedUsername, 'Username already in use.');

          const member = {
            _id: $id.newId(),
            username,
            email,
            contactId,
          } as Member;

          assign(contact, { memberId: member._id });

          const memberEvents = [createEvent('MemberCreated', member)];
          const contactEvents = [createEvent('ContactAssignedToMember', contact)];

          return startTransaction(session => {
            return Promise.all([
              document.saveWithEvents('members', member, memberEvents, { session }),
              document.saveWithEvents('contacts', contact, contactEvents, { session }),
            ]);
          }).then(() => member);
        });
      });
    },
  };

export default create;
