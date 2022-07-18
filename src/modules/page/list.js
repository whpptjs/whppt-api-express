const assert = require('assert');

module.exports = {
  exec({ $mongo: { $db } }, { collection }) {
    assert(collection, 'Please provide a collection');

    return $db
      .collection(collection)
      .find()
      .toArray()
      .then(pages => pages);
  },
};
