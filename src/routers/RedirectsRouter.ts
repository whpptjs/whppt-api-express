import { Router, NextFunction, Request, Response } from 'express';
import { chain, trimEnd } from 'lodash';
import { WhpptRequest } from '..';
import { WhpptMongoDatabase } from '../Services/Database/Mongo/Database';

export type RedirectsRouterConstructor = () => Router;

export const RedirectsRouter: RedirectsRouterConstructor = () => {
  const router = Router();

  router.use((req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve()
      .then(() => {
        const _url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        const from = chain(_url.pathname).toLower().trimEnd('/').value();

        if (from.startsWith('/api')) return next();
        if (from.startsWith('/_loading')) return next();

        return (req as WhpptRequest).moduleContext.then(({ $database }) => {
          return $database.then(database => {
            const { $db } = database as WhpptMongoDatabase;
            // TODO: find a way to do queries like this on different databases. ie. Mongo, Firebase
            return $db
              .collection('domains')
              .findOne({ hostnames: req.hostname })
              .then(domain => {
                const query =
                  domain && domain._id
                    ? { from: trimEnd(from, '/'), domainId: domain._id }
                    : {
                        from: trimEnd(from, '/'),
                        $or: [
                          { domainId: { $exists: false } },
                          { domainId: { $eq: '' } },
                        ],
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
      })
      .catch(err => {
        return res.status(500).send(`Redirects router failed: ${err.message}`);
      });
  });

  return router;
};
