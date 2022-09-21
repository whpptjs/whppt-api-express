const assert = require('assert');

module.exports = {
  exec(
    { $mongo: { $unpublish, $db, $startTransaction, $record }, $publishing },
    { _id, collection, user }
  ) {
    assert(_id, 'A Page Id must be provided.');
    assert(collection, 'Please provide a collection');

    let unpublishedPage;

    return $startTransaction(async session => {
      await $db
        .collection(collection)
        .updateOne({ _id }, { $set: { published: false } }, { session });
      await $unpublish(collection, _id, { session });
      await $record(collection, 'unpublish', { data: _id, user }, { session });
      unpublishedPage = $publishing.onUnPublish ? _id : undefined;
    }).then(() => unpublishedPage);
  },
};
