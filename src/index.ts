import { NextFunction, Router, Request, Response } from 'express';

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
import { S3, File, Image, Gallery, IdService, Logger, Security } from './Services';
import { DatabaseService } from './Services/Database';
import { MongoDatabaseConnection } from './Services/Database/Mongo/Connection';
import { DatabaseHostingConfig, HostingService } from './Services/Hosting';
import { ConfigService } from './Services/Config';
import { ContextType } from './context/Context';

export * from './Services/Config';

const adminDbConfig: DatabaseHostingConfig = {
  type: 'mongo',
  instance: { _id: 'whppt-shared', url: process.env.MONGO_URL || '' },
  db: process.env.MONGO_ADMIN_DB || 'WhpptAdmin',
  pubDb: '',
};

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

  router.use($hosting.middleware.checkForApiKey);
  router.use($config.middleware.waitForConfig);
  router.use($database.middleware.waitForAdminDbConnection);
  router.use($database.middleware.waitForApiDbConnection);
  router.use($security.authenticate);

  router.use((req: any, _: any, next: NextFunction) => {
    // TODO: Work towards a generic db and not specifically mongo here.
    const dbConnection = $database.getConnection(req.apiKey);
    const databasePromise = dbConnection.then(con => con.getDatabase());
    const hostingConfig = $hosting.getConfig(req.apiKey);
    // TODO: Work towards a generic storage api. S3 used here
    const $storage = S3(hostingConfig);

    req.moduleContext = ModuleContext(
      $id,
      $logger,
      $security,
      databasePromise,
      $config,
      hostingConfig,
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
  router.use(FileRouter());
  router.use(ImageRouter());
  router.use(GalleryRouter($logger));
  router.use(SeoRouter());

  router.get('/health', (req: any, res: Response) => {
    res.send('OK');
  });

  return router;
};
