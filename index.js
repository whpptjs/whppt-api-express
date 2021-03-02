const router = require('express-promise-json-router')();
const Image = require('./routers/imageRouter');
const File = require('./routers/fileRouter');
const Redirects = require('./routers/redirectsRouter');
const Context = require('./context');
const callModule = require('./modules/callModule');
const seoRouter = require('./routers/seoRouter');

module.exports = options => {
  options = options || {};
  options.apiPrefix = options.apiPrefix || 'api';
  options.disablePublishing = options.disablePublishing || false;

  return Context(options).then(context => {
    context.whpptOptions = options;

    const { $security, $logger } = context;

    router.get(`/${options.apiPrefix}/:mod/:query`, $security.authenticate, ({ user, params: { mod, query }, query: queryArgs }) => {
      return callModule(context, mod, query, { ...queryArgs, user }).catch(({ status, error }) => {
        $logger.error('Error in route: %s %s %O %O', mod, query, queryArgs, error);

        return { status, error };
      });
    });

    router.post(`/${options.apiPrefix}/:mod/:command`, $security.authenticate, ({ user, params: { mod, command }, body: cmdArgs }) => {
      return callModule(context, mod, command, { ...cmdArgs, user }).catch(({ status, error }) => {
        $logger.error('Error in route: %s %s %O %O', mod, command, cmdArgs, error);

        return { status, error };
      });
    });

    return Promise.all([Image(context), File(context), Redirects(context)]).then(([imageRouter, fileRouter, redirectsRouter]) => {
      router.use(redirectsRouter);
      router.use(imageRouter);
      router.use(fileRouter);
      router.use(seoRouter(options));

      return router;
    });
  });
};
