import Context from './context';
const router = require('express-promise-json-router')();
const callModule = require('./modules/callModule');
const File = require('./routers/fileRouter');
const Image = require('./routers/imageRouter');
const Redirects = require('./routers/redirectsRouter');
const seoRouter = require('./routers/seoRouter');
const Gallery = require('./routers/galleryFileRouter');

export * from './modules/HttpModule';

module.exports = (options: any) => {
  options = options || {};
  options.apiPrefix = options.apiPrefix || 'api';
  options.disablePublishing = options.disablePublishing || false;

  return Context(options).then(context => {
    context.whpptOptions = options;

    const { $security, $logger } = context;

    router.get(`/${options.apiPrefix}/:mod/:query`, $security.authenticate, (req: any) => {
      const {
        user,
        params: { mod, query },
        query: queryArgs,
      } = req;
      return callModule(context, mod, query, { ...queryArgs, user }, req).catch(({ status, error }: { status: any; error: any }) => {
        $logger.error('Error in route: %s %s %O %O', mod, query, queryArgs, error);

        return { status, error };
      });
    });

    router.post(`/${options.apiPrefix}/:mod/:command`, $security.authenticate, (req: any) => {
      const {
        user,
        params: { mod, command },
        body: cmdArgs,
      } = req;
      return callModule(context, mod, command, { ...cmdArgs, user }, req).catch(({ status, error }: { status: any; error: any }) => {
        $logger.error('Error in route: %s %s %O %O', mod, command, cmdArgs, error);

        return { status, error };
      });
    });

    return Promise.all([Image(context), File(context), Redirects(context), Gallery(context)]).then(([imageRouter, fileRouter, redirectsRouter, galleryFileRouter]) => {
      router.use(redirectsRouter);
      router.use(galleryFileRouter);
      router.use(imageRouter);
      router.use(fileRouter);
      router.use(seoRouter(options));

      return router;
    });
  });
};

module.exports.Context = Context;
