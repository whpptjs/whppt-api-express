const assert = require('assert');
const { toLower } = require('lodash');

module.exports = {
  authorise({ $roles }, { user }) {
    return Promise.resolve(!$roles.isGuest(user));
  },
  exec({ $mongo: { $db, $save }, $id, $security, apiKey }, { newUser }) {
    const { username, email } = newUser;

    const lowerUsername = toLower(username);
    const lowerEmail = toLower(email);

    assert(username || email, 'Missing Field: Please provide a username or email');

    return findExistingUsers($db, lowerUsername, lowerEmail).then(existingUser => {
      let error = '';

      if (
        existingUser &&
        existingUser.username &&
        lowerUsername === toLower(existingUser.username)
      )
        error = 'Username already taken, please try another username';
      if (
        existingUser &&
        existingUser.email &&
        existingUser.email !== '' &&
        lowerEmail === toLower(existingUser.email)
      )
        error = 'Email address already taken, please try another email';

      assert(!existingUser, error);

      const user = {
        _id: $id.newId(),
        username: lowerUsername,
        email: lowerEmail,
      };

      return $security
        .generateAccessToken(apiKey, user._id)
        .then(({ token, tokenExpiry }) => {
          user.passwordResetToken = { token, tokenExpiry };

          return $save('users', user).then(() => {
            return generateResetLink(token, lowerEmail);
          });
        });
    });
  },
};

async function findExistingUsers($db, username, email) {
  const searchParams = [];

  if (username) searchParams.push({ username: new RegExp(`^${username}$`, 'iu') });
  if (email) searchParams.push({ email: new RegExp(`^${email}$`, 'iu') });

  return $db.collection('users').findOne({ $or: searchParams });
}

function generateResetLink(token, email) {
  return `${process.env.BASE_URL}/?token=${token}&email=${email}`;
}
