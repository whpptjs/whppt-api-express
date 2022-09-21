const assert = require('assert');

module.exports = {
  exec(
    { $mongo: { $startTransaction, $delete, $db, $record } },
    { _id, collection, user }
  ) {
    assert(_id, 'A Page Id must be provided.');
    assert(collection, 'Please provide a collection.');

    return $startTransaction(async session => {
      await $db.collection('dependencies').deleteMany({ parentId: _id }, { session });
      await $delete(collection, _id, { session });
      await $record(collection, 'delete', { data: _id, user }, { session });
    });
  },
};
