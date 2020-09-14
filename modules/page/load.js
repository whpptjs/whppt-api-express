const assert = require('assert');

module.exports = {
  exec({ $mongo: { $db } }, { slug, collection }) {
    assert(slug, 'Please provide a slug.');
    assert(slug, 'Please provide a collection.');

    return $db
      .collection(collection)
      .findOne({ slug })
      .then(page => {
        if (!page) return { status: 404, message: 'Page not found' };
        return page;
      })
      .catch(err => {
        throw err;
      });
  },
};
