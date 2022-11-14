import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Staff } from './Model';

const create: HttpModule<
  { firstName: string; lastName: string; username: string; email: string },
  Staff
> = {
  exec({ $database, $id, createEvent }, { firstName, lastName, username, email }) {
    assert(email, 'An email is required');
    assert(firstName, 'A first name is required');
    assert(lastName, 'A last name is required');
    assert(username, 'A username is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return document.query<Staff>('staff', { filter: { email } }).then(usedEmail => {
        assert(!usedEmail, 'Email already in use.');

        const staffMember = {
          _id: $id.newId(),
          firstName,
          lastName,
          username,
          email,
        } as unknown as Staff;

        const events = [createEvent('StaffMemberCreated', staffMember)];

        return startTransaction(session => {
          return document.saveWithEvents('staff', staffMember, events, { session });
        }).then(() => staffMember);
      });
    });
  },
};

export default create;
