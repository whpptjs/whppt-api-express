const $id = require('./id');
const $logger = require('./logger');
const Security = require('./security');
const Mongo = require('./mongo');
const loadModules = require('./modules/loadModules');

console.log('TCL: process.cwd', process.cwd());
const config = require(process.cwd() + '/whppt.js');

module.exports = () =>
  Promise.all([Mongo({ $logger })]).then(([mongo]) => {
    return {
      $id,
      $logger,
      $security: Security({ $logger, $id, config }),
      $mongo: mongo,
      $modules: loadModules,
    };
  });
