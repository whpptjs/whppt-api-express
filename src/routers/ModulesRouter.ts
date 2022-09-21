import { Router, Request } from 'express';
import PromiseJsonRouter from 'express-promise-json-router';
import { ContextType } from '../context/Context';
import { WhpptConfig } from '../Config';
import callModule from '../modules/callModule';
import { LoggerService } from '../Services';

export type ModuleRouterArgs = {
  config: WhpptConfig;
  $logger: LoggerService;
  context: Promise<ContextType>;
};
export type ModulesRouter = (args: ModuleRouterArgs) => Router;

export const ModulesRouter: ModulesRouter = ({ $logger, context, config }) => {
  const router = PromiseJsonRouter();

  router.get(`/${config.apiPrefix}/:mod/:query`, (req: Request) => {
    return context.then(ctx => {
      const { user, params, query: queryArgs } = req;
      const { mod, query } = params;
      return callModule(ctx, mod, query, { ...queryArgs, user }, req).catch(
        ({ status, error }: { status: any; error: any }) => {
          $logger.error('Error in route: %s %s %O %O', mod, query, queryArgs, error);
          return { status, error };
        }
      );
    });
  });

  router.post(`/${config.apiPrefix}/:mod/:command`, (req: any) => {
    return context.then(ctx => {
      const { user, params, body: cmdArgs } = req;
      const { mod, command } = params;
      return callModule(ctx, mod, command, { ...cmdArgs, user }, req).catch(
        ({ status, error }: { status: any; error: any }) => {
          $logger.error('Error in route: %s %s %O %O', mod, command, cmdArgs, error);

          return { status, error };
        }
      );
    });
  });

  return router;
};
