import { HttpModule } from '../HttpModule';
import assert from 'assert';
import omit from 'lodash/omit';
import { Staff } from './Model';
import { WhpptDatabase } from 'src/Services';
import { Contact } from '../contact/Models/Contact';

const login: HttpModule<{ username: string; password: string }, any> = {
  exec({ $database, $security, $logger, apiKey }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    return $database.then(db => {
      return findStaff(db, username).then(staffMember => {
        if (!staffMember || !staffMember.password)
          return Promise.reject(
            new Error(
              "The username / email address you entered isn't connected to an account."
            )
          );

        return $security.encrypt(password).then((encrypted: string) => {
          $logger.dev('Checking password for member %s, %s', username, encrypted);

          return $security
            .compare(password, staffMember.password || '')
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

const findStaff = (db: WhpptDatabase, username: string) => {
  return Promise.all([
    db.document.query<Staff>('staff', { filter: { username } }),
    db.document.query<Contact>('contacts', { filter: { email: username } }),
  ]).then(([staff, contact]) => {
    if (staff) return staff;
    assert(
      contact,
      "The username / email address you entered isn't connected to an account."
    );
    return db.document.query<Staff>('staff', { filter: { contactId: contact._id } });
  });
};

export default login;
