const assert = require('assert');

module.exports = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $mongo: { $db, $save }, $id }, { newUser }) {
    const { username, email } = newUser;

    assert(username || email, 'Missing Field: Please provide a username or email');

    return findExistingUsers($db, username, email).then(existingUser => {
      let error = '';

      if (existingUser && existingUser.username && username === existingUser.username) error = 'Username already taken, please try another username';
      if (existingUser && existingUser.email && existingUser.email !== '' && email === existingUser.email) error = 'Email address already taken, please try another email';

      assert(!existingUser, error);

      const user = {
        _id: $id(),
        username,
        email,
      };

      return generateAccessToken(user._id).then(({ token, tokenExpiry }) => {
        user.passwordResetToken = { token, tokenExpiry };

        return $save('users', user).then(() => {
          return generateResetLink(token, email);
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
  const searchParams = [];

  if (username) searchParams.push({ username });
  if (email) searchParams.push({ email });

  return $db.collection('users').findOne({ $or: searchParams });
}

function generateResetLink(token, email) {
  return `${process.env.BASE_URL}/?token=${token}&email=${email}`;
}
