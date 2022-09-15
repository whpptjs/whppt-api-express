import { Router } from 'express';

import { WhpptConfig } from './Config';
import Context from './context';
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

  const context = Context($id, $logger, $security, $mongo, $gallery, { ...config });
  const router = Router();

  router.use($security.authenticate);
  // Wait for mongo to connect before using routes that need mongo.
  router.use((_, __, next) => $mongo.then(() => next()));
  router.use(ModulesRouter({ $logger, context, config }));
  router.use(RedirectsRouter($mongo));
  router.use(GalleryRouter($gallery, $mongo));
  router.use(SeoRouter(context, config));

  return router;
};
