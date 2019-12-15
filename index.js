const router = require('express-promise-json-router')();

const context = require('./context');

router.get('/api/:mod', ({ user, params: { mod }, query: queryArgs }) => {
  return callModule(mod, 'get', queryArgs, user);
});

router.post('/api/login', ({ body }) => {
  return callModule('login', 'post', body);
});

router.post('/api/:mod', ({ user, params: { mod }, body }) => {
  return callModule(mod, 'post', body, user);
});

router.delete('/api/:mod', ({ user, params: { mod }, body }) => {
  return callModule(mod, 'delete', body, user);
});

module.exports = router;
