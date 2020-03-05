const assert = require('assert');

module.exports = {
  exec({ $mongo: { $unpublish, $db } }, { _id }) {
    assert(_id, 'A Redirect Id must be provided.');
    return $db
      .collection('redirects')
      .updateOne({ _id }, { $set: { published: false } })
      .then(() => {
        return $unpublish('redirects', _id);
      });
  },
};
