import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

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

export const JwtProvider: SecurityProviderConstructor = ({ $id, config }) => ({
  init() {
    const opts = {
      jwtFromRequest: expectBearerToken ? extractFromBearer() : extractFromCookies,
      secretOrKey: config.jwt?.secret,
      issuer: config.jwt?.issuer || 'whppt',
      audience: config.jwt?.audience || '',
    };

    return new JwtStrategy(opts, function (jwtPayload, done) {
      // TODO: Verify the token has not been invalidated
      done(null, jwtPayload.sub);
    });
  },
  authenticate(req, res, next) {
    // return new Promise((_, reject) => {
    passport.authenticate('jwt', function (err, user) {
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
  createToken(user) {
    return jwt.sign(
      {
        iss: config.jwt?.issuer,
        aud: config.jwt?.audience,
        sub: user,
        jti: $id.newId(),
        alg: 'HS256',
      },
      config.jwt?.secret || ''
    );
  },
});
