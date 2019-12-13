const $id = require('./id');
const Mongo = require('./mongo');
const Image = require('./Image');
const $logger = require('./logger');
const Security = require('./security');
const Doc = require('./Doc');
const loadModules = require('./modules/loadModules');

const $mongo = Mongo({ $logger });

module.exports = {
  $id,
  $logger,
  $mongo,
  $image: Image({ $logger, $mongo }),
  $doc: Doc(),
  $security: Security({ $id, $mongo }),
  $modules: loadModules(['modules/**/*.js']),
};
