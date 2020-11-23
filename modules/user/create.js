const assert = require('assert');

module.exports = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $mongo: { $db, $save }, $id }, { newUser }) {
    const { username, email } = newUser;

    assert(username || email, 'Missing Field: Please provide a username or email');

    return findExistingUsers($db, username, email).then(existingUser => {
      const error =
        existingUser && username === existingUser.username ? 'Username already taken, please try another username' : 'Email address already taken, please try another email';
      assert(!existingUser, error);

      const user = {
        _id: $id(),
        username,
        email,
      };

      return generateAccessToken(user._id).then(({ token, tokenExpiry }) => {
        user.passwordResetToken = { token, tokenExpiry };

        return $save('users', user).then(() => {
          return generateResetLink(token);
        });
      });
    });
  },
};

async function generateAccessToken(userId) {
  let crypto;

  try {
    assert(process.env.APP_KEY, 'No APP_KEY env variable was provided.');

    crypto = require('crypto');

    const expiryInMinutes = 1440;

    const token = crypto.createHmac('sha256', process.env.APP_KEY).update(userId).digest('hex');
    const tokenExpiry = new Date(new Date().getTime() + expiryInMinutes * 60000);

    return {
      token,
      tokenExpiry,
      valid: true,
    };
  } catch (err) {
    return Promise.reject('Crypto support is disabled.');
  }
}

async function findExistingUsers($db, username, email) {
  return $db.collection('users').findOne({ $or: [{ username }, { email }] });
}

function generateResetLink(token) {
  return `${process.env.BASE_URL}/?token=${token}`;
}
