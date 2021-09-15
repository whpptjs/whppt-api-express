const assert = require('assert');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Jwt = require('./jwt');

const saltRounds = 10;

module.exports = ({ $id, $logger, config = {} }) => {
  const encrypt = password => {
    return bcrypt.hash(password, saltRounds).then();
  };

  const compare = (password, hash) => {
    return bcrypt.compare(password, hash);
  };

  if (!config.security) return { encrypt, compare };

  const providers = { jwt: Jwt({ $id, config: config.security }) };

  passport.use(providers[config.security.provider].init());
  passport.initialize();

  $logger.info('Security Configured for provider:', config.security.provider);

  return {
    authenticate: providers[config.security.provider].authenticate,
    createToken: providers[config.security.provider].createToken,
    encrypt,
    compare,
    generateAccessToken,
  };
};

async function generateAccessToken(userId, expiryInMinutes = 1440) {
  let crypto;

  try {
    const appKey = process.env.APP_KEY;

    assert(appKey, 'No APP_KEY env variable was provided.');

    crypto = require('crypto');

    const token = crypto.createHmac('sha256', appKey).update(userId).digest('hex');
    const tokenExpiry = new Date(new Date().getTime() + expiryInMinutes * 60000);

    return {
      token,
      tokenExpiry,
      valid: true,
    };
  } catch (err) {
    // TODO: handle assert from above as well as crypto not supported errors here.
    return Promise.reject('Crypto support is disabled.');
  }
}
