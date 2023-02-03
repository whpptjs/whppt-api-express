import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Contact } from '../contact/Models/Contact';

const signUp: HttpModule<{ name: string; email: string }, any> = {
  exec({ $database, $id, createEvent }, { name, email }) {
    assert(name, 'A name is required');
    assert(email, 'An email is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      document.query<Contact>('contacts', { filter: { email } }).then(usedEmail => {
        assert(!usedEmail, 'Email already in use.');

        let splitName;
        let firstName;
        let lastName;

        if (name.includes(' ')) {
          splitName = name.split(' ');
          firstName = splitName[0];
          lastName = splitName[1];
        } else {
          firstName = name;
        }

        const contact = {
          _id: $id.newId(),
          firstName,
          lastName,
          email,
        } as Contact;

        const events = [createEvent('ContactCreated', contact)];

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
