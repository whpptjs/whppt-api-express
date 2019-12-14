const $logger = require('./logger');
const loadModules = require('./modules/loadModules');
const Mongo = require('./mongo');

module.exports = {
  $logger,
  $modules: loadModules(['modules/**/*.js']),
  $mongo: Mongo({ $logger }),
};
