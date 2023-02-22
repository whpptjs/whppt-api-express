import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Contact } from '../contact/Models/Contact';

const signUp: HttpModule<{ name: string; email: string }, void> = {
  exec({ $database, $id, createEvent }, { name, email }) {
    assert(name, 'A name is required');
    assert(email, 'An email is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return document
        .query<Contact>('contacts', { filter: { email } })
        .then(usedEmail => {
          if (usedEmail && usedEmail.isSubscribed) return;

          const events = [] as any[];

          let contact = {} as Contact;

          if (!usedEmail) {
            let firstName;
            let lastName;
            let splitName;

            if (name.includes(' ')) {
              splitName = name.split(' ');
              firstName = splitName[0];
              lastName = splitName[1];
            } else {
              firstName = name;
            }
            contact = {
              _id: $id.newId(),
              firstName,
              lastName,
              email,
              isSubscribed: true,
            } as Contact;
            events.push(createEvent('ContactCreated', contact));

            events.push(
              createEvent('ContactOptedInForMarketing', {
                contactId: contact._id,
                isSubscribed: true,
              })
            );
          } else {
            contact = usedEmail;
            contact.isSubscribed = true;
            events.push(
              createEvent('ContactOptedInForMarketing', {
                contactId: contact._id,
                isSubscribed: true,
              })
            );
          }

          console.log('🚀 ~ file: signup.ts:52 ~ exec ~ events:', events);
          return startTransaction(session => {
            return document
              .saveWithEvents('contacts', contact, events, { session })
              .then(() => {
                return document.publishWithEvents('contacts', contact, events, {
                  session,
                });
              });
          });
        });
    });
  },
};

export default signUp;
