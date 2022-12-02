import { HttpModule } from '../HttpModule';
import assert from 'assert';
import omit from 'lodash/omit';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Staff } from './Model';

const login: HttpModule<{ username: string; password: string }, any> = {
  exec({ $database, $security, $logger, apiKey }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection<Staff>('staff')
        .findOne({
          $or: [{ username }, { email: username }],
        })
        .then(staffMember => {
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

export default login;
