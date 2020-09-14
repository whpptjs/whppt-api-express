const assert = require('assert');
const { unPublishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $mongo: { $unpublish, $db } }, { _id, collection }) {
    assert(_id, 'A Page Id must be provided.');
    assert(collection, 'Please provide a collection');

    return $db
      .collection(collection)
      .updateOne({ _id }, { $set: { published: false } })
      .then(() => {
        return $unpublish('pages', _id).then(() => {
          if (!unPublishCallBack) return;
          return unPublishCallBack(_id);
        });
      });
  },
};
