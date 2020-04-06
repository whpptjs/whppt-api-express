const router = require('express-promise-json-router')();
const Image = require('./imageRouter');
const Context = require('./context');
const callModule = require('./modules/callModule');
const ObjectRestMethods = require('./ObjectRestMethods');

module.exports = () => {
  return Context().then(context => {
    const { $security } = context;
    const objectRestMethods = ObjectRestMethods(context);

    router.get('/api/:mod/:query', $security.authenticate, ({ user, params: { mod, query }, query: queryArgs }) => {
      return callModule(context, mod, query, { ...queryArgs, user });
    });

    router.post('/api/:mod/:command', $security.authenticate, ({ user, params: { mod, command }, body: cmdArgs }) => {
      return callModule(context, mod, command, { ...cmdArgs, user });
    });

    router.get('/api/obj/:type', $security.authenticate, objectRestMethods.list);
    router.get('/api/obj/:type/:id', $security.authenticate, objectRestMethods.get);
    router.post('/api/obj/:type', $security.authenticate, objectRestMethods.post);
    router.delete('/api/obj/:type/:id', $security.authenticate, objectRestMethods.del);

    return Promise.all([Image()]).then(([imageRouter]) => {
      router.use(imageRouter);
      return router;
    });
  });
};
