import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Member } from '../member/Model';
import { Contact } from './Models/Contact';

const changeEmail: HttpModule<{ email: string; contactId: string }, void> = {
  exec({ $database, createEvent }, { email, contactId }) {
    assert(email, 'A email is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return Promise.all([
        document.fetch<Contact>('contacts', contactId),
        document.query<Member>('members', {
          filter: { contactId },
        }),
        document.query<Contact>('contacts', {
          filter: { email, _id: { $ne: contactId } },
        }),
      ]).then(([contact, member, emailInUse]) => {
        assert(contact, 'Unable to find Contact.');
        assert(!emailInUse, 'Email already in use.');

        if (noChanges(contact, email)) return;

        const contactEvents = [
          createEvent('ContactEmailUpdated', {
            contactId: contact._id,
            email,
            from: contact.email,
          }),
        ];
        assign(contact, { email });

        return startTransaction(session => {
          const promises = [
            document.saveWithEvents('contacts', contact, contactEvents, { session }),
          ] as Promise<any>[];

          if (member) {
            const memberEvents = [
              createEvent('MemberEmailUpdated', {
                memberId: member._id,
                email,
                from: member.email,
              }),
            ];
            assign(member, { email });

            promises.push(
              document.saveWithEvents('members', member, memberEvents, { session })
            );
          }
          return Promise.all(promises);
        });
      });
    });
  },
};

const noChanges = (contact: Contact, email: string) => {
  return contact.email === email;
};

export default changeEmail;
