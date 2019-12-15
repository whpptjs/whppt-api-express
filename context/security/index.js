const assert = require('assert');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = ({ $id, config }) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: (config.security && config.security.secret) || 'changeme',
    issuer: (config.security && config.security.issuer) || 'whppt',
    audience: (config.security && config.security.audience) || '',
  };

  passport.use(
    new JwtStrategy(opts, function(jwtPayload, done) {
      done(null, jwtPayload.sub);
    })
  );

  return {
    initialize() {
      return passport.initialize();
    },
    // authenticate(strategy = 'jwt') {
    //   assert(strategy, 'Authentication strategy not specified.');

    //   return (req, res, next) => {
    //     passport.authenticate(strategy, function(err, user) {
    //       if (err) return Promise.reject(err);
    //       if (!user) return Promise.reject(new Error('No user found.'));

    //       req.user = user;
    //       next();
    //     })(req, res, next);
    //   };
    // },
    authenticate(req, res) {
      return new Promise((resolve, reject) => {
        passport.authenticate('jwt', function(err, user) {
          if (err) return reject(err);
          if (!user) return reject(new Error('No user found.'));
          resolve(user);
        })(req, res);
      });
    },
    createToken(user) {
      return jwt.sign(
        {
          iss: opts.issuer,
          aud: opts.audience,
          sub: user,
          jti: $id(),
          alg: 'HS256',
        },
        opts.secretOrKey
      );
    },
    encrypt(password) {
      return bcrypt.hash(password, saltRounds).then();
    },
    compare(password, hash) {
      return bcrypt.compare(password, hash);
    },
  };
};
