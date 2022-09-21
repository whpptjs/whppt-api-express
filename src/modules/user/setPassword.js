const assert = require('assert');
const crypto = require('crypto');
const { omit } = require('lodash');

module.exports = {
  exec({ $security, $mongo: { $db, $save } }, { username, email, password, token }) {
    assert(token, 'No token provided');
    assert(username || email, 'Please provide a username or email.');
    assert(password, 'Please provide a password.');

    return $db
      .collection('users')
      .findOne({
        $or: [
          { username: new RegExp(`^${username}$`, 'iu') },
          { email: new RegExp(`^${email}$`, 'iu') },
        ],
      })
      .then(matchingUser => {
        assert(matchingUser, `User with username/email ${username || email} not found`);
        assert(
          matchingUser.passwordResetToken,
          'User has not requested to reset their password'
        );

        const tokenToCompare = crypto
          .createHmac('sha256', process.env.APP_KEY)
          .update(matchingUser._id)
          .digest('hex');
        const tokenMatches =
          matchingUser.passwordResetToken.token === token &&
          crypto.timingSafeEqual(Buffer.from(tokenToCompare), Buffer.from(token));
        const tokenExpired = matchingUser.passwordResetToken.tokenExpiry < Date.now();

        if (!tokenMatches) throw new Error('Failed to validate the provided token.');
        if (tokenExpired)
          throw new Error('Token has expired, please try again with a valid token.');

        return $security.encrypt(password).then(hashedPassword => {
          matchingUser.password = hashedPassword;
          matchingUser.passwordResetToken = undefined;

          return $save('users', matchingUser).then(() =>
            omit(matchingUser, ['password'])
          );
        });
      });
  },
};
