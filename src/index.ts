import PromiseJsonRouter from 'express-promise-json-router';

import { WhpptConfig } from './Config';
import { ModulesRouter, RedirectsRouter, GalleryRouter, SeoRouter } from './routers';
import { $s3, Gallery, IdService, Logger, Mongo, Security } from './Services';

export * from './Config';

export const Whppt = (config: WhpptConfig) => {
  config.apiPrefix = config.apiPrefix || 'api';

  const $id = IdService();
  const $logger = Logger();
  const $security = Security({ $id, $logger, config });
  const $mongo = Mongo({ $id, $logger, config });
  const $storage = $s3;
  const $gallery = Gallery($id, $mongo, $storage);

  const router = PromiseJsonRouter();
  router.use($security.authenticate);

  // Wait for mongo to connect before using routes that need mongo.
  router.use((_, __, next) => $mongo.then(() => next()));

  router.use(ModulesRouter({ $id, $logger, $security, $mongo, $gallery, config }));
  router.use(RedirectsRouter($mongo));
  router.use(GalleryRouter($gallery, $mongo));
  router.use(SeoRouter($id, $logger, $security, $mongo, $gallery, config));

  return router;
};
