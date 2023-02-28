import assert from 'assert';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { MarketArea, Staff, StaffDepartment } from './Model';

const createFromContact: HttpModule<
  {
    contactId: string;
    username: string;
    password: string;
    department: StaffDepartment;
    marketArea: MarketArea;
  },
  Staff
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec(
    { $database, $id, createEvent, $security },
    { contactId, username, password, department, marketArea }
  ) {
    assert(contactId, 'A contact Id is required');

    return $database.then(database => {
      return $security.encrypt(password).then(hashedPassword => {
        const { document, startTransaction } = database;

        return Promise.all([
          document.query<Contact>('contacts', { filter: { _id: contactId } }),
          document.query<Staff>('staff', { filter: { contactId } }),
        ]).then(([contact, alreadyAStaffMember]) => {
          assert(contact, 'Could not find contact.');
          assert(!alreadyAStaffMember, 'Contact is already a staff member.');

          const staff = {
            _id: $id.newId(),
            contactId,
            username,
            department,
            marketArea,
            password: hashedPassword,
          } as Staff;

          const staffEvents = [
            createEvent('StaffMemberCreated', {
              staffId: staff._id,
              contactId,
              username,
              department,
              marketArea,
            }),
          ];

          return startTransaction(session => {
            return document
              .saveWithEvents('staff', staff, staffEvents, { session })
              .then(() => {
                return document.publishWithEvents('staff', staff, staffEvents, {
                  session,
                });
              });
          }).then(() => staff);
        });
      });
    });
  },
};

export default createFromContact;
