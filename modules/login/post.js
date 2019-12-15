const assert = require('assert');
const { omit } = require('lodash');

module.exports = {
  exec({ $mongo, $security }, { identifier, password }) {
    return $mongo.then(({ db }) => {
      assert(identifier, 'A username or email address is required.');
      assert(password, 'A password is required.');

      return db
        .collection(COLLECTIONS.USERS)
        .findOne(
          {
            $or: [{ username: identifier }, { email: identifier }],
          },
          { username: true, firstname: true, lastname: true, email: true, roles: true, password: true }
        )
        .then(user => {
          if (!user) throw new Error('Something went wrong. Could not log in.');
          return $security.compare(password, user.password).then(passwordMatches => {
            if (passwordMatches) return { token: $security.createToken(omit(user, ['password'])) };
            throw new Error('Something went wrong. Could not log in.');
          });
        });
    });
  },
};
