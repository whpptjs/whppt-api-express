import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Contact } from './Models/Contact';

const create: HttpModule<
  { firstName: string; lastName: string; email: string },
  Contact
> = {
  exec({ $database, $id, createEvent }, { firstName, lastName, email }) {
    assert(email, 'An email is required');
    assert(firstName, 'A first name is required');
    assert(lastName, 'A last name is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return document
        .query<Contact>('contacts', { filter: { email } })
        .then(usedEmail => {
          assert(!usedEmail, 'Email already in use.');

          const contact = {
            _id: $id.newId(),
            firstName,
            lastName,
            email,
          } as Contact;

          const events = [createEvent('ContactCreated', contact)];

          return startTransaction(session => {
            return document.saveWithEvents('contacts', contact, events, { session });
          }).then(() => contact);
        });
    });
  },
};

export default create;
