import { Request, Response, NextFunction } from 'express';
import { Strategy } from 'passport';

import { WhpptUser } from '../User';
import { IdService, LoggerService, HostingService, WhpptSecurityConfig } from '../..';

export type SecurityProviderOptions = {
  $id: IdService;
  $logger: LoggerService;
  $hosting: HostingService;
  config: WhpptSecurityConfig;
};
export type SecurityProvider = {
  init: () => Strategy;
  authenticate: (req: Request, res: Response, next: NextFunction) => void;
  createToken: (apiKey: string, user: WhpptUser) => Promise<string>;
};
export type SecurityProviderConstructor = (
  options: SecurityProviderOptions
) => SecurityProvider;
