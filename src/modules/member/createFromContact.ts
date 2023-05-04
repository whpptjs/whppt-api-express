import assert from 'assert';
import { ToggleSubscription } from '../contact/Common/ToggleSubscription';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';

const createFromContact: HttpModule<
  { contactId: string; isSubscribed?: boolean },
  Member
> = {
  exec(context, { contactId, isSubscribed }) {
    assert(contactId, 'A contact Id is required');
    const { $database, $id, createEvent } = context;

    return $database.then(database => {
      const { document, startTransaction } = database;

      return Promise.all([
        document.query<Contact>('contacts', { filter: { _id: contactId } }),
        document.query<Member>('members', { filter: { contactId } }),
      ]).then(([contact, alreadyAMember]) => {
        assert(contact, 'Could not find contact.');
        assert(!alreadyAMember, 'Contact is already a member.');

        const member = {
          _id: $id.newId(),
          contactId,
        } as Member;

        const memberEvents = [createEvent('MemberCreated', member)];

        return startTransaction(session => {
          return document
            .saveWithEvents('members', member, memberEvents, { session })
            .then(() => {
              return ToggleSubscription(
                { ...context, document },
                { contact, isSubscribed: isSubscribed || false },
                session
              );
            });
        }).then(() => member);
      });
    });
  },
};

export default createFromContact;
