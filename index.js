const router = require('express-promise-json-router')();

const context = require('./context');

router.get('/api/:mod', ({ params: { mod }, query: queryArgs }) => {
  return callModule(mod, 'get', queryArgs);
});

router.post('/api/:mod', ({ params: { mod }, body }) => {
  return callModule(mod, 'post', body);
});

router.delete('/api/:mod', ({ params: { mod }, body }) => {
  return callModule(mod, 'delete', body);
});

module.exports = router;
