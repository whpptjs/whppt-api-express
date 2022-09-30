import { Router, Request } from 'express';
import PromiseJsonRouter from 'express-promise-json-router';
import { WhpptRequest } from '..';
import { LoggerService } from '../Services';
import callModule from '../modules/callModule';

export type ModulesRouter = ($logger: LoggerService, apiPrefix: string) => Router;

export const ModulesRouter: ModulesRouter = ($logger, apiPrefix) => {
  const router = PromiseJsonRouter();

  router.get(`/${apiPrefix}/:mod/:query`, (req: Request) => {
    const { user, params, query: queryArgs } = req;
    const { mod, query } = params;
    return (req as WhpptRequest).moduleContext.then(ctx => {
      return callModule(ctx, mod, query, { ...queryArgs, user }, req).catch(err => {
        const { status, error } = err;
        $logger.error(
          'Error in modules route [GET]: %s %s %O %O',
          mod,
          query,
          queryArgs,
          error || err
        );
        return { status: status || 500, error: error || err };
      });
    });
  });

  router.post(`/${apiPrefix}/:mod/:command`, (req: any) => {
    const { user, params, body: cmdArgs } = req;
    const { mod, command } = params;
    return (req as WhpptRequest).moduleContext.then(ctx => {
      return callModule(ctx, mod, command, { ...cmdArgs, user }, req).catch(err => {
        const { status, error } = err;
        $logger.error(
          'Error in modules route [POST]: %s %s %O %O',
          mod,
          command,
          cmdArgs,
          error || err
        );
        return { status: status || 500, error: error || err };
      });
    });
  });

  return router;
};
