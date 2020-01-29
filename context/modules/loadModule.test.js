const test = require('ava');

test('loadModules', t => {
  const modulePromise = require('./loadModules');
  return modulePromise.then(modules => {
    t.truthy(modules.page);
    t.truthy(modules.user);
  });
});
