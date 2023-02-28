import assert from 'assert';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Staff, StaffDepartment, MarketArea } from './Model';

const save: HttpModule<
  {
    _id: string;
    contactId: string;
    marketArea: MarketArea;
    department: StaffDepartment;
    firstName: string;
    lastName: string;
    isActive: boolean;
  },
  Staff
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec(
    { $database, createEvent },
    { _id, contactId, department, firstName, lastName, isActive, marketArea }
  ) {
    assert(_id, 'A Staff Id is required');
    assert(contactId, 'A contact Id is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return Promise.all([
        document.query<Contact>('contacts', { filter: { _id: contactId } }),
        document.query<Staff>('staff', { filter: { _id } }),
      ]).then(([contact, staffMember]) => {
        assert(contact, 'Could not find contact.');
        assert(staffMember, 'Could not find staffMember.');

        staffMember.isActive = isActive;
        staffMember.department = department;
        staffMember.marketArea = marketArea;
        contact.firstName = firstName;
        contact.lastName = lastName;

        const staffEvents = [
          createEvent('StaffMemberDetailsChanged', {
            staffId: staffMember._id,
            staffMember,
          }),
        ];

        const contactEvents = [
          createEvent('ContactDetailsChanged', {
            contactId: contact._id,
            firstName,
            lastName,
            phone: contact.phone,
            company: contact.company,
            email: contact.email,
            from: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              phone: contact.phone,
              company: contact.company,
              email: contact.email,
            },
          }),
        ];

        return startTransaction(session => {
          return document
            .saveWithEvents('staff', staffMember, staffEvents, { session })
            .then(() =>
              document.publishWithEvents('staff', staffMember, staffEvents, { session })
            )
            .then(() =>
              document.saveWithEvents('contacts', contact, contactEvents, { session })
            )
            .then(() =>
              document.publishWithEvents('contacts', contact, contactEvents, { session })
            );
        }).then(() => staffMember);
      });
    });
  },
};

export default save;
