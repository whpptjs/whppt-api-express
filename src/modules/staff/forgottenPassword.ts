import assert from 'assert';
import { assign } from 'lodash';
import { Contact } from '../contact/Models/Contact';
import { HttpModule } from '../HttpModule';
import { Staff } from './Model';

const forgottenPassword: HttpModule<{ email: string }, void> = {
  exec({ $database, $security, createEvent, apiKey, $email }, { email }) {
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
              const events = [createEvent('RequestedResetPasswordForStaff', { email })];

              return $security.generateAccessToken(apiKey, staff._id, 60).then(token => {
                assign(staff, { resetPasswordToken: token });

                return startTransaction(session => {
                  return document
                    .saveWithEvents('staff', staff, events, { session })
                    .then(() => {
                      //TODO (Ben): get site domain dynamically.
                      const domain = 'domain.com.au';
                      const recoveryPageLink = `${domain}/hentley-password-recovery/staff?email=${email}&recoveryToken=${token.token}`;

                      let html = `
                        <h3>Password reset for ${usedEmail.firstName} ${usedEmail.lastName}</h3>

                        <div>
                            <p>
                              It seems like you forgot your password. If this is true, click the link below to reset your password.
                            </p>
                            <p>Reset your password <a href=${recoveryPageLink}>here</a></p>
                            <p>If you did not forget your password, please disregard this email.</p>
                        </div>
                        `;

                      return $email.send({
                        to: email,
                        subject: 'Rcover your password',
                        html,
                      });

                      //TODO ?? (Ben): log email sent or send email to @svelte
                    });
                });
              });
            });
        })
        .then(() => {});
    });
  },
};

export default forgottenPassword;
