import { Router, NextFunction, Request, Response } from 'express';
import { chain, trimEnd } from 'lodash';
import { MongoService } from '../Services';

export type RedirectsRouterConstructor = ($mongo: Promise<MongoService>) => Router;

export const RedirectsRouter: RedirectsRouterConstructor = $mongo => {
  const router = Router();

  router.use((req: Request, res: Response, next: NextFunction) => {
    const _url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const from = chain(_url.pathname).toLower().trimEnd('/').value();

    if (from.startsWith('/api')) return next();
    if (from.startsWith('/_loading')) return next();

    return $mongo.then(({ $db }) => {
      return $db
        .collection('domains')
        .findOne({ hostnames: req.hostname })
        .then(domain => {
          const query =
            domain && domain._id
              ? { from: trimEnd(from, '/'), domainId: domain._id }
              : {
                  from: trimEnd(from, '/'),
                  $or: [{ domainId: { $exists: false } }, { domainId: { $eq: '' } }],
                };

          return $db
            .collection('redirects')
            .findOne(query)
            .then(redirect => {
              if (redirect) {
                return res.redirect(301, redirect.to);
              }

              next();
            });
        });
    });
  });

  return router;
};
