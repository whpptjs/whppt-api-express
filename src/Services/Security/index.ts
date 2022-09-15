import assert from 'assert';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import crypto from 'crypto';

import type { WhpptConfig } from '../../Config';
import type { IdService } from '../Id';
import type { LoggerService } from '../Logger';

import { JwtProvider } from './Providers/Jwt';
import { SecurityProvider } from './Providers/Provider';
import { WhpptUser } from './User';

const saltRounds = 10;

export type SecurityServiceArgs = {
  $id: IdService;
  $logger: LoggerService;
  config: WhpptConfig;
};
export type SecurityService = {
  encrypt: (password: string) => Promise<string>;
  compare: (password: string, hash: string) => Promise<boolean>;
  authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  createToken: (user: WhpptUser) => string;
  generateAccessToken: (
    userId: string,
    expiryInMinutes: number
  ) => Promise<{
    token: string;
    tokenExpiry: Date;
    valid: boolean;
  }>;
};
export type SecurityServiceConstructor = (args: SecurityServiceArgs) => SecurityService;

export const Security: SecurityServiceConstructor = ({ $id, $logger, config }) => {
  const jwt = JwtProvider({ $id, $logger, config: config.security });
  const providers: { [k: string]: SecurityProvider } = { jwt };
  const configuredProvider = providers[config.security.provider];

  passport.use(configuredProvider.init());
  passport.initialize();

  $logger.info('Security Configured for provider:', config.security.provider);

  return {
    encrypt: password => bcrypt.hash(password, saltRounds),
    compare: (password, hash) => bcrypt.compare(password, hash),
    authenticate: configuredProvider.authenticate,
    createToken: configuredProvider.createToken,
    generateAccessToken,
  };
};

async function generateAccessToken(userId: string, expiryInMinutes = 1440) {
  try {
    const appKey = process.env.APP_KEY;

    assert(appKey, 'No APP_KEY env variable was provided.');

    const token = crypto
      .createHmac('sha256', appKey)
      .update(userId.toString())
      .digest('hex');
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
