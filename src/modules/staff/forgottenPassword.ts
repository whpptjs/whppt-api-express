import assert from 'assert';
import { assign } from 'lodash';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Staff } from './Model';

const forgottenPassword: HttpModule<{ email: string }, void> = {
  exec({ $database, $security, createEvent, apiKey }, { email }) {
    assert(email, 'A email is required');

    return $database.then(database => {
      const { document, startTransaction } = database;
      return document
        .query<Contact>('contacts', { filter: { email } })
        .then(usedEmail => {
          if (!usedEmail)
            return Promise.reject({ status: 404, message: 'No staff member found' });

          return document
            .query<Staff>('staff', {
              filter: { contactId: usedEmail._id },
            })
            .then(staff => {
              if (!staff)
                return Promise.reject({ status: 404, message: 'No staff member found' });
              const events = createEvent('RequestedResetPasswordForStaff', { email });

              return $security.generateAccessToken(apiKey, staff._id, 60).then(token => {
                assign(staff, { resetPasswordToken: token });

                return startTransaction(session => {
                  return document.saveWithEvents('staff', staff, events, { session });
                });
              });
            });
        })
        .then(() => {});
    });
  },
};

export default forgottenPassword;
