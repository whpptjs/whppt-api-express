import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Contact } from './Models/Contact';

export type FindContactOrCreateArgs = {
  email: string;
  contactId?: string;
};

const findContactOrCreate: HttpModule<FindContactOrCreateArgs, Contact> = {
  exec({ $database, $id, createEvent }, { email, contactId }) {
    assert(email, 'Contact email is required.');

    return $database.then(({ document, startTransaction }) => {
      const query = contactId
        ? { _id: contactId }
        : ({ email } as { email?: string; _id?: string });

      return document.query<Contact>('contacts', { filter: query }).then(_contact => {
        if (_contact) return _contact;

        const contact = {
          _id: $id.newId(),
          email,
        };

        const event = createEvent('CreatedContact', contact);

        return startTransaction(session => {
          return document.saveWithEvents('contacts', contact, [event], { session });
        }).then(() => contact);
      });
    });
  },
};

export default findContactOrCreate;
