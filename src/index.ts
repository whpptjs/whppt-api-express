import { Router } from 'express';

import { WhpptConfig } from './Services/Config';
import Context from './context';
import {
  ModulesRouter,
  RedirectsRouter,
  GalleryRouter,
  SeoRouter,
  FileRouter,
  ImageRouter,
} from './routers';
import {
  $s3,
  File,
  Image,
  Gallery,
  IdService,
  Logger,
  Mongo,
  Security,
} from './Services';
import { DatabaseService } from './Services/Database';
import { MongoDatabaseConnection } from './Services/Database/Mongo/Connection';
import { DatabaseHostingConfig, HostingService } from './Services/Hosting';
import { ConfigService } from './Services/Config';

export * from './Services/Config';

const adminDbConfig: DatabaseHostingConfig = {
  type: 'mongo',
  instance: { _id: 'whppt-shared', url: process.env.MONGO_URL || '' },
  db: process.env.MONGO_ADMIN_DB || 'WhpptAdmin',
  pubDb: '',
};

export const Whppt = (config: WhpptConfig) => {
  config.apiPrefix = config.apiPrefix || 'api';
  const router = Router();

  const $id = IdService();
  const $logger = Logger();
  const $security = Security({ $id, $logger, config });
  const $config = ConfigService($logger, config);
  const adminDb = MongoDatabaseConnection($logger, adminDbConfig);
  const $hosting = HostingService(adminDb);
  const $database = DatabaseService($logger, $hosting, adminDb);

  router.use($hosting.middleware.checkForApiKey);
  router.use($config.middleware.waitForConfig);
  router.use($database.middleware.waitForAdminDbConnection);
  router.use($database.middleware.waitForApiDbConnection);
  router.use($security.authenticate);
  // router.use(hosting.build);

  const $storage = $s3;
  const $gallery = Gallery($id, $mongo, $storage);
  const $file = File($id, $mongo, $storage, config);
  const $image = Image($id, $mongo, $storage, config);

  const context = Context($id, $logger, $security, $mongo, $gallery, $image, $file, {
    ...config,
  });

  router.use(ModulesRouter({ $logger, context, config }));
  router.use(RedirectsRouter($mongo));
  router.use(FileRouter($file, $mongo));
  router.use(ImageRouter($image));
  router.use(GalleryRouter($gallery, $mongo));
  router.use(SeoRouter(context, config));

  return router;
};
