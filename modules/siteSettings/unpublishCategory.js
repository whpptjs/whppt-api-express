const assert = require('assert');

module.exports = {
  exec({ $mongo: { $unpublish, $db } }, { _id }) {
    assert(_id, 'A Category Id must be provided.');
    return $db
      .collection('categories')
      .updateOne({ _id }, { $set: { published: false } })
      .then(() => {
        return $unpublish('categories', _id);
      });
  },
};
