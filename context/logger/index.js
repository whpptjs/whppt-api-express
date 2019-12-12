const debug = require('debug');

module.exports = {
  info: debug('whppt:info'),
  error: debug('whppt:error'),
  warning: debug('whppt:warning'),
  dev: debug('whppt:dev'),
};
