const assert = require('assert');

module.exports = {
  exec({ $mongo: { $unpublish } }, { _id }) {
    assert(_id, 'A Page Id must be provided.');

    return $unpublish('pages', _id);
  },
};
