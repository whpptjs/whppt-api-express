const assert = require('assert');
const { omit } = require('lodash');

module.exports = {
  exec({ $mongo: { $db }, $security, $logger }, { username, password }) {
    assert(username, 'A username or email address is required.');
    assert(password, 'A password is required.');

    return $db
      .collection('users')
      .findOne(
        {
          $or: [{ username }, { email: username }],
        },
        { username: true, firstname: true, lastname: true, email: true, roles: true, password: true }
      )
      .then(user => {
        if (!user) return Promise.reject(new Error('Something went wrong. Could not log you in.'));

        return $security.encrypt(password).then(encrypted => {
          $logger.dev('Checking password for user %s, %s', username, encrypted);

          return $security.compare(password, user.password).then(passwordMatches => {
            if (passwordMatches) return { token: $security.createToken(omit(user, ['password'])) };

            return Promise.reject(new Error('Something went wrong. Could not log in.'));
          });
        });
      });
  },
};
