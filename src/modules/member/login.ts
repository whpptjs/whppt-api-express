import { HttpModule } from '../HttpModule';
import assert from 'assert';
import omit from 'lodash/omit';
import { Member } from './Model';
import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';

const login: HttpModule<{ username: string; password: string }, any> = {
  exec({ $database, $security, $logger }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    type MemberProjection = {
      _id: string;
      username: string;
      email: string;
      password: string;
    };

    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection<Member>('members')
        .findOne<MemberProjection>(
          {
            $or: [{ username }, { email: username }],
          },
          {
            username: 1,
            email: 1,
            password: 1,
            contactId: 1,
          } as any
        )
        .then(member => {
          if (!member)
            return Promise.reject(
              new Error('Something went wrong. Could not log you in.')
            );

          return $security.encrypt(password).then((encrypted: string) => {
            $logger.dev('Checking password for member %s, %s', username, encrypted);

            return $security
              .compare(password, member.password)
              .then((passwordMatches: boolean) => {
                if (!passwordMatches)
                  return Promise.reject(
                    new Error('Something went wrong. Could not log in.')
                  );

                return $security
                  .createToken('legacy', omit(member, 'password'))
                  .then(token => {
                    return {
                      token,
                    };
                  });
              });
          });
        });
    });
  },
};

export default login;
