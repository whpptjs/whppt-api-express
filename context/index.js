const $id = require('./id');
const $logger = require('./logger');
const Security = require('./security');
const Mongo = require('./mongo');
const loadModules = require('./modules/loadModules');
const $atdw = require('./atdw');
const $axios = require('./axios');

const config = require(process.cwd() + '/whppt.config.js');

module.exports = () => {
  return Promise.all([Mongo({ $logger })]).then(([mongo]) => {
    return {
      $id,
      $logger,
      $security: Security({ $logger, $id, config }),
      $mongo: mongo,
      $modules: loadModules,
      $atdw,
      $axios,
    };
  });
};
