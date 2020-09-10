const router = require('express-promise-json-router')();
const Image = require('./routers/imageRouter');
const File = require('./routers/fileRouter');
const Context = require('./context');
const callModule = require('./modules/callModule');
const ObjectRestMethods = require('./routers/ObjectRestMethods');
const callAction = require('./modules/callAction');
const seoRouter = require('./routers/seoRouter');

module.exports = options => {
  options = options || {};
  options.module = options.module || {};
  options.apiPrefix = options.apiPrefix || 'api';
  options.disablePublishing = options.disablePublishing || false;

  return Context(options).then(context => {
    const { $security } = context;
    const objectRestMethods = ObjectRestMethods(context);

    router.get(`/${options.apiPrefix}/obj/:type/checkSlug`, $security.authenticate, objectRestMethods.checkSlug);
    router.get(`/${options.apiPrefix}/obj/:type`, $security.authenticate, objectRestMethods.list);
    router.get(`/${options.apiPrefix}/obj/:type/:id`, $security.authenticate, objectRestMethods.get);
    router.post(`/${options.apiPrefix}/obj/:type`, $security.authenticate, objectRestMethods.post);
    router.delete(`/${options.apiPrefix}/obj/:type/:id`, $security.authenticate, objectRestMethods.del);

    router.get(`/${options.apiPrefix}/:mod/:query`, $security.authenticate, ({ user, params: { mod, query }, query: queryArgs }, _, next) => {
      if (!options.module[mod] || !options.module[mod].queries || !options.module[mod].queries[query]) return next();
      return callAction(context, options.module[mod].queries[query], { ...queryArgs, user });
    });

    router.post(`/${options.apiPrefix}/:mod/:command`, $security.authenticate, ({ user, params: { mod, command }, body: cmdArgs }, _, next) => {
      if (!options.module[mod] || !options.module[mod].commands || !options.module[mod].commands[command]) return next();
      return callAction(context, options.module[mod].commands[command], { ...cmdArgs, user });
    });

    router.get(`/${options.apiPrefix}/:mod/:query`, $security.authenticate, ({ user, params: { mod, query }, query: queryArgs }) => {
      return callModule(context, mod, query, { ...queryArgs, user });
    });

    router.post(`/${options.apiPrefix}/:mod/:command`, $security.authenticate, ({ user, params: { mod, command }, body: cmdArgs }) => {
      return callModule(context, mod, command, { ...cmdArgs, user });
    });

    return Promise.all([Image(context), File(context)]).then(([imageRouter, fileRouter]) => {
      router.use(imageRouter);
      router.use(fileRouter);
      router.use(seoRouter(options));
      return router;
    });
  });
};
