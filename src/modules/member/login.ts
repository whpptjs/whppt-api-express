import { HttpModule } from '../HttpModule';
import assert from 'assert';
import omit from 'lodash/omit';
import { Member } from './Model';
import { Contact } from '../contact/Models/Contact';
import { WhpptDatabase } from 'src/Services';

const login: HttpModule<{ username: string; password: string }, any> = {
  exec({ $database, $security, apiKey }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    return $database.then(database => {
      return findMember(database, username).then(member => {
        if (!member)
          return Promise.reject(
            new Error(
              "The username / email address you entered isn't connected to an account."
            )
          );

        if (!member.password)
          return Promise.reject(new Error('This account is not verified'));

        return $security
          .compare(password, member.password)
          .then((passwordMatches: boolean) => {
            if (!passwordMatches)
              return Promise.reject(
                new Error("The password that you've entered is incorrect.")
              );

            return $security
              .createToken(apiKey, omit(member, ['password', 'notes']))
              .then(token => {
                return {
                  token,
                  memberId: member._id,
                };
              });
          });
      });
    });
  },
};

const findMember = (db: WhpptDatabase, username: string) => {
  return Promise.all([
    db.document.query<Member>('members', { filter: { username: new RegExp(`^${username}$`, 'iu') } }),
    db.document.query<Contact>('contacts', { filter: { email: new RegExp(`^${username}$`, 'iu') } }),
  ]).then(([member, contact]) => {
    if (member) return member;
    assert(
      contact,
      "The username / email address you entered isn't connected to an account."
    );
    return db.document.query<Member>('members', { filter: { contactId: contact._id } });
  });
};

export default login;
