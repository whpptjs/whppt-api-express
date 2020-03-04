const assert = require('assert');

module.exports = {
  exec({ $mongo: { $unpublish, $db } }, { _id }) {
    console.log('exec -> _id', _id);
    assert(_id, 'A Page Id must be provided.');
    return $db
      .collection('pages')
      .updateOne({ _id }, { $set: { published: false } })
      .then(() => {
        return $unpublish('pages', _id);
      });
  },
};
