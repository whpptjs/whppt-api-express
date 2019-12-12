const $logger = require('./logger');
const loadModules = require('./modules/loadModules');

const $mongo = Mongo({ $logger });

module.exports = {
  $logger,
  $modules: loadModules(['modules/**/*.js']),
};
