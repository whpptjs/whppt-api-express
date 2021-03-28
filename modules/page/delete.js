const assert = require('assert');

module.exports = {
  exec({ $mongo: { $startTransaction, $delete, $db } }, { _id, collection }) {
    assert(_id, 'A Page Id must be provided.');
    assert(collection, 'Please provide a collection.');

    return $startTransaction(session => {
      return $db
        .collection('dependencies')
        .deleteMany({ parentId: _id }, { session })
        .then(() => $delete(collection, _id, { session }));
    });
  },
};
