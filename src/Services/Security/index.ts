import assert from 'assert';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import crypto from 'crypto';

import type { WhpptSecurityConfig } from '../Config';
import type { IdService } from '../Id';
import type { LoggerService } from '../Logger';

import { JwtProvider } from './Providers/Jwt';
import { SecurityProvider } from './Providers/Provider';
import { WhpptUser } from './User';
import { HostingService } from '../Hosting';

const saltRounds = 10;

export type SecurityServiceArgs = {
  $id: IdService;
  $logger: LoggerService;
  $hosting: HostingService;
  config: WhpptSecurityConfig;
};
export type SecurityService = {
  encrypt: (password: string) => Promise<string>;
  compare: (password: string, hash: string) => Promise<boolean>;
  authenticate: (req: Request, res: Response, next: NextFunction) => void;
  createToken: (apiKey: string, user: WhpptUser) => Promise<string>;
  generateAccessToken: (
    apiKey: string,
    userId: string,
    expiryInMinutes: number
  ) => Promise<{
    token: string;
    tokenExpiry: Date;
    valid: boolean;
  }>;
};
export type SecurityServiceConstructor = (args: SecurityServiceArgs) => SecurityService;

export const Security: SecurityServiceConstructor = ({
  $id,
  $logger,
  $hosting,
  config,
}) => {
  const jwt = JwtProvider({ $id, $logger, $hosting, config });
  const providers: { [k: string]: SecurityProvider } = { jwt };
  const configuredProvider = providers[config.provider];

  passport.use(configuredProvider.init());
  passport.initialize();

  $logger.info('Security Configured for provider:', config.provider);

  const generateAccessToken = (
    apiKey: string,
    userId: string,
    expiryInMinutes = 1440
  ) => {
    return $hosting
      .getConfig(apiKey)
      .then(({ security }) => {
        assert(security?.appKey, 'No appKey was provided. Check your hosting config');

        const token = crypto
          .createHmac('sha256', security.appKey)
          .update(userId.toString())
          .digest('hex');
        const tokenExpiry = new Date(new Date().getTime() + expiryInMinutes * 60000);

        return {
          token,
          tokenExpiry,
          valid: true,
        };
      })
      .catch(err => {
        // TODO: handle assert from above as well as crypto not supported errors here.
        return Promise.reject(`Crypto support is disabled. ${err}`);
      });
  };

  return {
    encrypt: password => bcrypt.hash(password, saltRounds),
    compare: (password, hash) => bcrypt.compare(password, hash),
    authenticate: configuredProvider.authenticate,
    createToken: configuredProvider.createToken,
    generateAccessToken,
  };
};
