import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Contact, ContactShipping } from './Models/Contact';

export type ChangeContactShippingArgs = {
  contactId: string;
  shipping: ContactShipping;
};

const changeShippingDetails: HttpModule<ChangeContactShippingArgs, void> = {
  exec(context, { contactId, shipping }) {
    const { $database, createEvent } = context;
    assert(contactId, 'Contact Id is required.');
    assert(shipping.address, 'Address is required.');
    assert(shipping.address.number, 'Address number is required.');
    assert(shipping.address.street, 'Address street is required.');
    assert(shipping.address.suburb, 'Address suburb is required.');
    assert(shipping.address.state, 'Address state is required.');
    assert(shipping.address.country, 'Address country is required.');
    assert(shipping.address.postCode, 'Address postCode is required.');

    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Contact>('contacts', contactId).then(contact => {
        assert(contact, 'Contact not found.');

        const event = createEvent('ContactShippingDetailsUpdated', {
          contactId,
          shipping,
          from: {
            ...contact.shipping,
          },
        });

        assign(contact, {
          shipping: {
            ...contact.shipping,
            address: shipping.address,
            contactDetails: shipping.contactDetails || {
              firstName: contact.firstName,
              lastName: contact.lastName,
              company: contact.company,
            },
          },
        });

        return startTransaction(session => {
          return document.saveWithEvents('contacts', contact, [event], { session });
        });
      });
    });
  },
};

export default changeShippingDetails;
