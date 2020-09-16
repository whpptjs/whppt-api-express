const assert = require('assert');

module.exports = {
  exec({ $mongo: { $delete, $db } }, { _id, collection }) {
    assert(_id, 'A Page Id must be provided.');
    assert(collection, 'Please provide a collection.');

    return $delete(collection, _id);
  },
};
