const assert = require('assert');
const { toLower } = require('lodash');

module.exports = {
  authorise() {
    // TODO: this needs to be fixed urgently
    return Promise.resolve();
  },
  exec({ $mongo: { $db, $save }, $id, $security }, { newUser }) {
    const { username, email } = newUser;

    const lowerUsername = toLower(username);
    const lowerEmail = toLower(email);

    assert(username || email, 'Missing Field: Please provide a username or email');

    return findExistingUsers($db, lowerUsername, lowerEmail).then(existingUser => {
      let error = '';

      if (existingUser && existingUser.username && lowerUsername === existingUser.username) error = 'Username already taken, please try another username';
      if (existingUser && existingUser.email && existingUser.email !== '' && lowerEmail === existingUser.email) error = 'Email address already taken, please try another email';

      assert(!existingUser, error);

      const user = {
        _id: $id(),
        username: lowerUsername,
        email: lowerEmail,
      };

      return $security.generateAccessToken(user._id).then(({ token, tokenExpiry }) => {
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

  if (username) searchParams.push({ username });
  if (email) searchParams.push({ email });

  return $db.collection('users').findOne({ $or: searchParams });
}

function generateResetLink(token, email) {
  return `${process.env.BASE_URL}/?token=${token}&email=${email}`;
}
