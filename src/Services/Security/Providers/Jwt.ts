import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, SecretOrKeyProvider } from 'passport-jwt';

import type { Request } from 'express';

import { WhpptUser } from '../User';
import { SecurityProviderConstructor } from './Provider';

const extractFromCookies = function (req: Request) {
  if (req && req.cookies) return req.cookies.authToken;
  return null;
};
const extractFromBearer = function () {
  return ExtractJwt.fromAuthHeaderAsBearerToken();
};

const expectBearerToken = process.env.TOKEN_SRC === 'Bearer';

export const JwtProvider: SecurityProviderConstructor = ({ $id, $hosting, config }) => ({
  init() {
    const fetchSecret: SecretOrKeyProvider = (req: any, rawJwtToken, done) => {
      $hosting
        .getConfig(req.apiKey)
        .then(securityConfig => {
          const opts: jwt.VerifyOptions = {
            issuer: config.jwt?.issuer || 'whppt',
            audience: securityConfig.security.audience || '',
            maxAge: '7d',
          };
          jwt.verify(rawJwtToken, securityConfig.security.appKey, opts, (err: any) => {
            if (err) console.log('🚀 JWT VERIFY ERROR: ', err);
            done(err, securityConfig.security.appKey);
          });
        })
        .catch(done);
    };

    const opts = {
      jwtFromRequest: expectBearerToken ? extractFromBearer() : extractFromCookies,
      secretOrKeyProvider: fetchSecret,
    };

    return new JwtStrategy(opts, function (jwtPayload, done) {
      // TODO: Verify the token has not been invalidated
      done(null, jwtPayload.sub);
    });
  },
  authenticate(req, res, next) {
    // return new Promise((_, reject) => {
    passport.authenticate('jwt', function (err: any, user: any) {
      if (err) {
        res.status(401).send('Could not authenticate').send();
        return;
      }

      req.user = !user
        ? WhpptUser({ _id: 'guest', username: 'Guest' })
        : (req.user = WhpptUser(user));

      next();
    })(req, res);
    // });
  },
  createToken(apiKey, user) {
    return $hosting.getConfig(apiKey).then(({ security }) => {
      return jwt.sign(
        {
          iss: config.jwt?.issuer,
          aud: security.audience || '',
          sub: user,
          jti: $id.newId(),
          alg: 'HS256',
        },
        security.appKey
      );
    });
  },
});
