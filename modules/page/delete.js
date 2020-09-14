const assert = require('assert');
const { map } = require('lodash');

module.exports = {
  exec({ $mongo: { $delete, $db } }, { _id, collection }) {
    assert(_id, 'A Page Id must be provided.');

    return $delete(collection, _id);
  },
};
