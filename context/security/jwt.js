const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

module.exports = ({ $id }) => ({
  init(config) {
    const opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: (config.jwt && config.jwt.secret) || 'changeme',
      issuer: (config.jwt && config.jwt.issuer) || 'whppt',
      audience: (config.jwt && config.jwt.audience) || '',
    };
    return new JwtStrategy(opts, function(jwtPayload, done) {
      // TODO: Verify the token has not been invalidated
      done(null, jwtPayload.sub);
    });
  },
  authenticate(req, res, next) {
    return new Promise((__, reject) => {
      passport.authenticate('jwt', function(err, user) {
        if (err) return reject(err);
        if (!user) req.user = { _id: 'guest', name: 'Guest', roles: { guest: true } };
        else req.user = user;
        next();
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
});
