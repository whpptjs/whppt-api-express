const assert = require('assert');
const { toLower } = require('lodash');

module.exports = {
  authorise({ $roles }, { user }) {
    return Promise.resolve(!$roles.isGuest(user));
  },
  exec({ $mongo: { $db, $save }, $id, $security, apiKey }, { userId }) {
    assert(userId, 'Missing Field: Please provide a id');

    return findExistingUsers($db, userId).then(existingUser => {
      assert(existingUser, 'User not found');

      return $security
        .generateAccessToken(apiKey, existingUser._id)
        .then(({ token, tokenExpiry }) => {
          existingUser.passwordResetToken = { token, tokenExpiry };

          return $save('users', existingUser).then(() => {
            return generateResetLink(token, existingUser.email);
          });
        });
    });
  },
};

async function findExistingUsers($db, _id) {
  return $db.collection('users').findOne({ _id });
}

function generateResetLink(token, email) {
  return `${process.env.BASE_URL}/?token=${token}&email=${email}`;
}
