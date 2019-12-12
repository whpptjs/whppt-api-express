const test = require('ava');
const logger = require('./index');

test('logger', t => {
  t.is(logger.info.namespace, 'whppt:info');
  t.is(logger.error.namespace, 'whppt:error');
  t.is(logger.warning.namespace, 'whppt:warning');
  t.is(logger.dev.namespace, 'whppt:dev');
});
