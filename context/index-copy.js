const Image = require('./Image');
const Security = require('./security');
const Doc = require('./Doc');

module.exports = {
  $image: Image({ $logger, $mongo }),
  $doc: Doc(),
  $security: Security({ $id, $mongo }),
};
