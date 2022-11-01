import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Contact } from './Models/Contact';

export type ChangeContactBillingArgs = {
  contactId: string;
  billing: {
    address: {
      number: string;
      street: string;
      suburb: string;
      city: string;
      state: string;
      country: string;
      postCode: string;
    };
  };
};

const changeBillingDetails: HttpModule<ChangeContactBillingArgs, void> = {
  exec(context, { contactId, billing }) {
    const { $database, createEvent } = context;
    assert(contactId, 'Contact Id is required.');
    assert(billing.address, 'Address is required.');
    assert(billing.address.number, 'Address number is required.');
    assert(billing.address.street, 'Address street is required.');
    assert(billing.address.suburb, 'Address suburb is required.');
    assert(billing.address.city, 'Address city is required.');
    assert(billing.address.state, 'Address state is required.');
    assert(billing.address.country, 'Address country is required.');
    assert(billing.address.postCode, 'Address postCode is required.');

    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Contact>('contacts', contactId).then(contact => {
        assert(contact, 'Order not found.');

        const event = createEvent('ContactBillingDetailsUpdated', {
          contactId,
          billing,
          from: {
            ...contact.billing,
          },
        });

        assign(contact, {
          billing: {
            ...contact.billing,
            address: billing.address,
            contactDetails: {
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

export default changeBillingDetails;
