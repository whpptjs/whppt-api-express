import { HttpModule } from '../HttpModule';
import assert from 'assert';
import omit from 'lodash/omit';
import { Staff } from './Model';
import { WhpptDatabase } from 'src/Services';
import { Contact } from '../contact/Models/Contact';

const login: HttpModule<{ username: string; password: string }, any> = {
  exec({ $database, $security, apiKey }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    return $database.then(db => {
      return findActiveStaff(db, username).then(staffMember => {
        return $security.encrypt(password).then(() => {
          return $security
            .compare(password, staffMember?.password || '')
            .then(passwordMatches => {
              if (!passwordMatches)
                return Promise.reject(
                  new Error("The password that you've entered is incorrect.")
                );

              return $security
                .createToken(apiKey, omit(staffMember, 'password'))
                .then(token => {
                  return {
                    token,
                    staffMember,
                  };
                });
            });
        });
      });
    });
  },
};

export const findActiveStaff = (db: WhpptDatabase, username: string) => {
  return Promise.all([
    db.document.query<Staff>('staff', { filter: { username } }),
    db.document.query<Contact>('contacts', { filter: { email: username } }),
  ]).then(([staff, contact]) => {
    if (staff) {
      if (!staff.password)
        return Promise.reject(
          new Error(
            "The username / email address you entered isn't connected to an account."
          )
        );
      if (!staff.isActive)
        return Promise.reject(new Error('This account has been deactivated.'));

      return staff;
    }

    assert(
      contact,
      "The username / email address you entered isn't connected to an account."
    );
    return db.document.query<Staff>('staff', {
      filter: { contactId: contact._id },
    });
  });
};

export default login;
