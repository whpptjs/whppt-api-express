import assert from 'assert';
import { assign } from 'lodash';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Staff } from './Model';

const resetPassword: HttpModule<
  { email: string; token: string; password: string; confirmPassword: string },
  void
> = {
  exec(
    { $database, $security, createEvent },
    { email, password, confirmPassword, token }
  ) {
    assert(email, 'A email is required');
    assert(token, 'A email is required');
    assert(password === confirmPassword, 'Passwords dont match');

    return $database.then(database => {
      const { document, startTransaction } = database;
      return Promise.all([
        document.query<Staff>('staff', { filter: { 'resetPasswordToken.token': token } }),
        document.query<Contact>('contacts', { filter: { email } }),
      ])
        .then(([staff, contact]) => {
          assert(contact, 'No staff member found');
          assert(staff, 'No staff member found');
          assert(contact._id === staff.contactId, 'No staff member found');

          const events = [createEvent('StaffResetPassword', { email })];

          return $security.encrypt(password).then(hashedPassword => {
            assign(staff, { resetPasswordToken: undefined, password: hashedPassword });

            return startTransaction(session => {
              return document.saveWithEvents('staff', staff, events, { session });
            });
          });
        })
        .then(() => {});
    });
  },
};

export default resetPassword;
