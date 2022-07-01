const assert = require('assert');

module.exports = {
  exec({ $mongo: { $unpublish, $db }, $publishing }, { _id, collection }) {
    assert(_id, 'A Page Id must be provided.');
    assert(collection, 'Please provide a collection');

    return $db
      .collection(collection)
      .updateOne({ _id }, { $set: { published: false } })
      .then(() => {
        return $unpublish(collection, _id).then(() => {
          if (!$publishing.onUnPublish) return;
          return $publishing.onUnPublish(_id);
        });
      });
  },
};
