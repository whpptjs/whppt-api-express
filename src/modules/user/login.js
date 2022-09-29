const assert = require('assert');
const { omit } = require('lodash');

module.exports = {
  exec({ $mongo: { $db }, $security, $logger, apiKey }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    return $db
      .collection('users')
      .findOne(
        {
          $or: [
            { username: new RegExp(`^${username}$`, 'iu') },
            { email: new RegExp(`^${username}$`, 'iu') },
          ],
        },
        {
          username: true,
          firstname: true,
          lastname: true,
          email: true,
          roles: true,
          password: true,
        }
      )
      .then(user => {
        if (!user)
          return Promise.reject(new Error('Something went wrong. Could not log you in.'));

        return $security.encrypt(password).then(encrypted => {
          $logger.dev('Checking password for user %s, %s', username, encrypted);

          return $security.compare(password, user.password).then(passwordMatches => {
            if (passwordMatches)
              return $security
                .createToken(apiKey, omit(user, ['password']))
                .then(token => ({ token }));

            return Promise.reject(new Error('Something went wrong. Could not log in.'));
          });
        });
      });
  },
};
