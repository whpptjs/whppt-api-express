import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Contact } from './Models/Contact';
import { saveContactAndPublish } from './Common/SaveContact';
import { ToggleSubscription } from './Common/ToggleSubscription';

const changeDetails: HttpModule<
  {
    firstName: string;
    lastName: string;
    phone: string;
    mobile: string;
    contactId: string;
    company: string;
    email: string;
    isSubscribed: boolean;
  },
  void
> = {
  exec(
    context,
    { firstName, lastName, phone, company, contactId, email, isSubscribed, mobile }
  ) {
    assert(firstName, 'A First name is required');
    assert(lastName, 'A last name is required');
    const { $database, createEvent } = context;
    return $database.then(database => {
      const { document, startTransaction } = database;

      return Promise.all([
        document.fetch<Contact>('contacts', contactId),
        document.query<Contact>('contacts', {
          filter: { email, _id: { $ne: contactId } },
        }),
      ]).then(([contact, emailInUse]) => {
        assert(contact, 'Unable to find Contact.');
        if (email) assert(!emailInUse, 'Email already in use.');

        if (
          noChanges(contact, {
            firstName,
            lastName,
            phone,
            company,
            email,
            mobile,
            isSubscribed,
          })
        )
          return;

        const contactEvents = [
          createEvent('ContactDetailsChanged', {
            contactId: contact._id,
            firstName,
            lastName,
            phone,
            mobile,
            company,
            email,
            from: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              phone: contact.phone,
              mobile: contact.mobile,
              company: contact.company,
              email: contact.email,
            },
          }),
        ];
        assign(contact, { firstName, lastName, phone, company, mobile });

        return startTransaction(session => {
          return saveContactAndPublish(
            { ...context, document },
            { contact, events: contactEvents },
            session
          ).then(() => {
            return ToggleSubscription(
              { ...context, document },
              { contact, isSubscribed },
              session
            );
          });
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
    mobile,
    company,
    email,
    isSubscribed,
  }: {
    firstName: string;
    lastName: string;
    phone: string;
    mobile: string;
    company: string;
    email: string;
    isSubscribed: boolean;
  }
) => {
  return (
    contact.firstName === firstName &&
    contact.lastName === lastName &&
    contact.company === company &&
    contact.email === email &&
    contact.phone === phone &&
    contact.mobile === mobile &&
    contact.isSubscribed === isSubscribed
  );
};

export default changeDetails;
