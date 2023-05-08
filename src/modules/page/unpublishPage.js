const assert = require('assert');

module.exports = {
  exec(context, { _id, collection, user }) {
    assert(_id, 'A Page Id must be provided.');
    assert(collection, 'Please provide a collection');
    const {
      $mongo: { $unpublish, $db, $startTransaction, $record },
      $publishing,
    } = context;

    return $startTransaction(async session => {
      await $db
        .collection(collection)
        .updateOne({ _id }, { $set: { published: false } }, { session });
      await $unpublish(collection, _id, { session });
      await $record(collection, 'unpublish', { data: _id, user }, { session });
      if ($publishing.onUnPublish)
        await $publishing.onUnPublish(context, { _id }, collection);
    }).then(() => _id);
  },
};
