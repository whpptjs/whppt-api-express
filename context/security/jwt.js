const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const jwt = require('jsonwebtoken');

const extractFromCookies = function (req) {
  if (req && req.cookies) return req.cookies.authToken;
  return null;
};

module.exports = ({ $id, config }) => ({
  init() {
    const opts = {
      jwtFromRequest: extractFromCookies,
      secretOrKey: config.jwt && config.jwt.secret,
      issuer: (config.jwt && config.jwt.issuer) || 'whppt',
      audience: (config.jwt && config.jwt.audience) || '',
    };

    return new JwtStrategy(opts, function (jwtPayload, done) {
      // TODO: Verify the token has not been invalidated
      done(null, jwtPayload.sub);
    });
  },
  authenticate(req, res, next) {
    return new Promise((_, reject) => {
      passport.authenticate('jwt', function (err, user, info) {
        if (err) return reject(err);

        if (!user) {
          req.user = { _id: 'guest', name: 'Guest', roles: [] };
        } else {
          user.roles = user.roles || [];
          req.user = user;
        }

        next();
      })(req, res);
    });
  },
  createToken(user) {
    return jwt.sign(
      {
        iss: config.jwt.issuer,
        aud: config.jwt.audience,
        sub: user,
        jti: $id(),
        alg: 'HS256',
      },
      config.jwt.secret
    );
  },
});
