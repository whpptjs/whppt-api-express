import assert from 'assert';
import { assign } from 'lodash';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';

const forgottenPassword: HttpModule<{ email: string }, void> = {
  exec({ $database, $security, createEvent, apiKey }, { email }) {
    assert(email, 'A email is required');

    return $database.then(database => {
      const { document, startTransaction } = database;
      return document
        .query<Contact>('contacts', { filter: { email } })
        .then(usedEmail => {
          if (!usedEmail)
            return Promise.reject({ status: 404, message: 'No member found' });

          return document
            .query<Member>('member', {
              filter: { contactId: usedEmail._id },
            })
            .then(member => {
              if (!member)
                return Promise.reject({ status: 404, message: 'No member found' });
              const events = createEvent('RequestedResetPasswordForMember', { email });

              return $security.generateAccessToken(apiKey, member._id, 60).then(token => {
                assign(member, { resetPasswordToken: token });

                return startTransaction(session => {
                  return document.saveWithEvents('member', member, events, { session });
                });
              });
            });
        })
        .then(() => {});
    });
  },
};

export default forgottenPassword;
