import { NextFunction, Request, Response } from 'express';
import { WhpptModule } from 'src/modules/HttpModule';
import { LoggerService } from '../Logger';

export type ConfigMiddleware = {
  waitForConfig(req: Request, res: Response, next: NextFunction): void;
};

export type ConfigMiddlewareFactory = (
  logger: LoggerService,
  loadModulePromise: Promise<{
    [key: string]: WhpptModule;
  }>
) => ConfigMiddleware;

export const ConfigMiddleware: ConfigMiddlewareFactory = (logger, loadModulePromise) => ({
  waitForConfig(_: Request, res: Response, next: NextFunction) {
    loadModulePromise
      .then(() => next())
      .catch(() => {
        const msg = 'Could not load modules.';
        logger.error(msg);
        res.status(500).send(msg);
      });
  },
});
