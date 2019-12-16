const Image = require('./Image');
const Doc = require('./Doc');

module.exports = {
  $image: Image({ $logger, $mongo }),
  $doc: Doc(),
};
