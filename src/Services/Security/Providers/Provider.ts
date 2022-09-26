import { Request, Response, NextFunction } from 'express';
import { Strategy } from 'passport';

import { WhpptUser } from '../User';
import type { WhpptSecurityConfig } from '../../Config';
import type { IdService } from '../../Id';
import type { LoggerService } from '../../Logger';

export type SecurityProviderOptions = {
  $id: IdService;
  $logger: LoggerService;
  config: WhpptSecurityConfig;
};
export type SecurityProvider = {
  init: () => Strategy;
  authenticate: (req: Request, res: Response, next: NextFunction) => void;
  createToken: (user: WhpptUser) => string;
};
export type SecurityProviderConstructor = (
  options: SecurityProviderOptions
) => SecurityProvider;
