import assert from 'assert';
import { assign } from 'lodash';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';

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
        document.query<Member>('members', {
          filter: { 'resetPasswordToken.token': token },
        }),
        document.query<Contact>('contacts', { filter: { email } }),
      ])
        .then(([member, contact]) => {
          assert(contact, 'No member member found');
          assert(member, 'No member member found');
          assert(contact._id === member.contactId, 'No member member found');

          const events = [createEvent('MemberResetPassword', { email })];

          return $security.encrypt(password).then(hashedPassword => {
            assign(member, { resetPasswordToken: undefined, password: hashedPassword });

            return startTransaction(session => {
              return document.saveWithEvents('members', member, events, { session });
            });
          });
        })
        .then(() => {});
    });
  },
};

export default resetPassword;
