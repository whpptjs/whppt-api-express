const router = require('express-promise-json-router')();
const Image = require('./imageRouter');
const ImageV2 = require('./imageRouterV2');
const Context = require('./context');
const callModule = require('./modules/callModule');
const ObjectRestMethods = require('./ObjectRestMethods');
const callAction = require('./modules/callAction');

module.exports = options => {
  options = options || {};
  options.module = options.module || {};

  return Context().then(context => {
    const { $security } = context;
    const objectRestMethods = ObjectRestMethods(context);

    router.get('/api/obj/:type', $security.authenticate, objectRestMethods.list);
    router.get('/api/obj/:type/:id', $security.authenticate, objectRestMethods.get);
    router.post('/api/obj/:type', $security.authenticate, objectRestMethods.post);
    router.delete('/api/obj/:type/:id', $security.authenticate, objectRestMethods.del);

    router.get('/api/:mod/:query', $security.authenticate, ({ user, params: { mod, query }, query: queryArgs }, _, next) => {
      if (!options.module[mod] || !options.module[mod].queries || !options.module[mod].queries[query]) return next();
      return callAction(context, options.module[mod].queries[query], { ...queryArgs, user });
    });

    router.post('/api/:mod/:command', $security.authenticate, ({ user, params: { mod, command }, body: cmdArgs }, _, next) => {
      console.log('options.module[mod]', options.module[mod]);
      console.log('command', command);
      console.log('cmdArgs', cmdArgs);
      if (!options.module[mod] || !options.module[mod].commands || !options.module[mod].commands[command]) return next();
      return callAction(context, options.module[mod].commands[command], { ...cmdArgs, user });
    });

    router.get('/api/:mod/:query', $security.authenticate, ({ user, params: { mod, query }, query: queryArgs }) => {
      return callModule(context, mod, query, { ...queryArgs, user });
    });
    router.post('/api/:mod/:command', $security.authenticate, ({ user, params: { mod, command }, body: cmdArgs }) => {
      return callModule(context, mod, command, { ...cmdArgs, user });
    });

    return Promise.all([Image(), ImageV2()]).then(([imageRouter, imageRouterV2]) => {
      router.use(imageRouter);
      router.use(imageRouterV2);
      return router;
    });
  });
};
