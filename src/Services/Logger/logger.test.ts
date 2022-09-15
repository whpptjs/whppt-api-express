import { Logger } from './index';

const logger = Logger();

test('logger', () => {
  expect(logger.info.namespace).toEqual('whppt:info');
  expect(logger.error.namespace).toEqual('whppt:error');
  expect(logger.warning.namespace).toEqual('whppt:warning');
  expect(logger.dev.namespace).toEqual('whppt:dev');
});
