const passport = require('passport');
const bcrypt = require('bcryptjs');
const Jwt = require('./jwt');
const saltRounds = 10;

module.exports = ({ $id, $logger, config }) => {
  const providers = { jwt: Jwt({ $id, config: config.security }) };

  passport.use(providers[config.security.provider].init());
  passport.initialize();

  $logger.info('Security Configured for provider:', config.security.provider);
  return {
    authenticate: providers[config.security.provider].authenticate,
    createToken: providers[config.security.provider].createToken,

    encrypt(password) {
      return bcrypt.hash(password, saltRounds).then();
    },
    compare(password, hash) {
      return bcrypt.compare(password, hash);
    },
  };
};
