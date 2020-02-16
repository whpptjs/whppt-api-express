const router = require('express-promise-json-router')();
const Context = require('./context');
const callModule = require('./modules/callModule');

const cache = require('express-cache-headers');
const oneDay = 60 * 60 * 24;

module.exports = () => {
  return Context().then(context => {
    const { $security } = context;

    router.get('/api/:mod/:query', $security.authenticate, ({ user, params: { mod, query }, query: queryArgs }) => {
      return callModule(context, mod, query, { ...queryArgs, user });
    });

    router.post('/api/:mod/:command', $security.authenticate, ({ user, params: { mod, command }, body: cmdArgs }) => {
      return callModule(context, mod, command, { ...cmdArgs, user });
    });

    return router;
  });
};
