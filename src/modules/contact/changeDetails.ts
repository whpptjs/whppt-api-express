import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Contact } from './Models/Contact';

const updateEmail: HttpModule<
  {
    firstName: string;
    lastName: string;
    phone: string;
    contactId: string;
    company: string;
  },
  void
> = {
  exec({ $database, createEvent }, { firstName, lastName, phone, company, contactId }) {
    assert(firstName, 'A First name is required');
    assert(lastName, 'A last name is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return document.fetch<Contact>('contacts', contactId).then(contact => {
        assert(contact, 'Unable to find Contact.');

        if (noChanges(contact, { firstName, lastName, phone, company })) return;

        const contactEvents = [
          createEvent('ContactDetailsChanged', {
            contactId: contact._id,
            firstName,
            lastName,
            phone,
            company,
            from: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              phone: contact.phone,
              company: contact.company,
            },
          }),
        ];
        assign(contact, { firstName, lastName, phone, company });

        return startTransaction(session => {
          return document.saveWithEvents('contacts', contact, contactEvents, { session });
        });
      });
    });
  },
};

const noChanges = (
  contact: Contact,
  {
    firstName,
    lastName,
    phone,
    company,
  }: { firstName: string; lastName: string; phone: string; company: string }
) => {
  return (
    contact.firstName === firstName &&
    contact.lastName === lastName &&
    contact.company === company &&
    contact.phone === phone
  );
};

export default updateEmail;
