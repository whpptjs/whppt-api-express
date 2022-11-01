import { Request, Response, NextFunction } from 'express';
import { Strategy } from 'passport';

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
  createToken: <T>(apiKey: string, user: T) => Promise<string>;
};
export type SecurityProviderConstructor = (
  options: SecurityProviderOptions
) => SecurityProvider;
