import { NextFunction, Router, Request, Response } from 'express';
import cors from 'cors';

import { WhpptConfig } from './Services/Config';
import ModuleContext from './context';
import {
  ModulesRouter,
  RedirectsRouter,
  GalleryRouter,
  SeoRouter,
  FileRouter,
  ImageRouter,
} from './routers';
import {
  S3,
  File,
  Image,
  Gallery,
  IdService,
  Logger,
  Security,
  // EmailService,
} from './Services';
import { DatabaseService } from './Services/Database';
import { MongoDatabaseConnection } from './Services/Database/Mongo/Connection';
import { HostingService } from './Services/Hosting';
import { ConfigService } from './Services/Config';
import { ContextType } from './context/Context';
import { adminDbConfig } from './Services/Hosting/adminDbConfig';
import { StripeRouter } from './routers/Stripe/index';

export * from './Services/Config';
export * from './modules/HttpModule';
export * from './replaceInList';

export type WhpptRequest = Request & {
  moduleContext: Promise<ContextType>;
};

export const Whppt = (config: WhpptConfig) => {
  config.apiPrefix = config.apiPrefix || 'api';
  const router = Router();

  const $id = IdService();
  const $logger = Logger();
  const $config = ConfigService($logger, config);

  $logger.info(
    'Configuring hosting db access to %o. Waiting for connection ...',
    adminDbConfig
  );
  const adminDb = MongoDatabaseConnection($logger, $id, adminDbConfig);
  adminDb
    .then(() => $logger.info('Admin db connected.'))
    .catch(() => {
      $logger.error('Admin db could not connect. Exiting process');
      process.exit(1);
    });

  const $hosting = HostingService(adminDb);
  const $database = DatabaseService($logger, $id, $hosting, $config, adminDb);
  const $security = Security({ $id, $logger, config: config.security, $hosting });

  router.get('/health', (_: any, res: Response) => {
    res.send('OK');
  });

  router.use($hosting.middleware.checkForApiKey);
  router.use($config.middleware.waitForConfig);
  router.use($database.middleware.waitForAdminDbConnection);

  const corsWhitelist = process.env.CORS_WHITELIST
    ? JSON.parse(process.env.CORS_WHITELIST)
    : [];
  $logger.info('Loading CORS whitelist:', corsWhitelist);

  router.use(
    cors((req: any, callback) => {
      $hosting
        .getConfig(req.apiKey)
        .then(hostingConfig => {
          const whitelist = [...corsWhitelist, ...hostingConfig.cors];
          const corsOptions =
            req.headers.origin && whitelist.indexOf(req.headers.origin) !== -1
              ? { origin: true }
              : { origin: false };
          $logger.dev(
            'CORS check complete: origin: %s, whitelist %s, options: %o',
            req.headers.origin,
            whitelist,
            corsOptions
          );
          callback(null, corsOptions);
        })
        .catch(err => {
          $logger.dev('CORS check error: ', err);
          callback(err);
        });
    })
  );

  router.use($database.middleware.waitForApiDbConnection);
  router.use($security.authenticate);

  router.use((req: any, _: any, next: NextFunction) => {
    // TODO: Work towards a generic db and not specifically mongo here.
    const dbConnection = $database.getConnection(req.apiKey);
    const hostingConfig = $hosting.getConfig(req.apiKey);
    const dbConfig = hostingConfig.then(c => c.database);
    const databasePromise = dbConnection.then(con => con.getDatabase(dbConfig));
    // TODO: Work towards a generic storage api. S3 used here
    const $storage = S3(hostingConfig);
    // const $email = EmailService;

    req.moduleContext = ModuleContext(
      $id,
      $logger,
      $security,
      databasePromise,
      $config,
      hostingConfig,
      // $email,
      $storage,
      Gallery($id, databasePromise, $storage),
      Image($id, databasePromise, $storage, config),
      File($id, databasePromise, $storage, config),
      req.apiKey
    );
    next();
  });

  router.use(ModulesRouter($logger, config.apiPrefix || 'api'));
  router.use(RedirectsRouter());
  router.use(FileRouter($logger));
  router.use(ImageRouter($logger));
  router.use(GalleryRouter($logger));
  router.use(SeoRouter());
  router.use(StripeRouter());

  if (config.routers && config.routers.length) {
    config.routers.forEach(entry => {
      router.use(entry.path, entry.routerFactory());
    });
  }

  return router;
};
