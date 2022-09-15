import { Router, Request } from 'express';
import PromiseJsonRouter from 'express-promise-json-router';
import Context from '../context';
import { WhpptConfig } from '../Config';
import callModule from '../modules/callModule';
import {
  LoggerService,
  SecurityService,
  IdService,
  MongoService,
  GalleryService,
} from '../Services';

export type ModuleRouterArgs = {
  config: WhpptConfig;
  $id: IdService;
  $logger: LoggerService;
  $security: SecurityService;
  $mongo: Promise<MongoService>;
  $gallery: GalleryService;
};
export type ModulesRouter = (args: ModuleRouterArgs) => Router;

export const ModulesRouter: ModulesRouter = ({
  $id,
  $logger,
  $security,
  $mongo,
  $gallery,
  config,
}) => {
  const router = PromiseJsonRouter();

  router.get(`/${config.apiPrefix}/:mod/:query`, (req: Request) => {
    const { user, params, query: queryArgs } = req;
    const { mod, query } = params;

    return Context($id, $logger, $security, $mongo, $gallery, { ...config }).then(
      context => {
        return callModule(context, mod, query, { ...queryArgs, user }, req).catch(
          ({ status, error }: { status: any; error: any }) => {
            $logger.error('Error in route: %s %s %O %O', mod, query, queryArgs, error);
            return { status, error };
          }
        );
      }
    );
  });

  return router;
};
