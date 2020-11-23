const assert = require('assert');

module.exports = {
  exec({ $mongo: { $db } }, { slug, collection, domainId }) {
    assert(collection, 'Please provide a collection.');
    assert(domainId, 'Please provide a domainId');

    return $db
      .collection(collection)
      .findOne({ slug, domainId })
      .then(page => {
        if (!page) return { status: 404, message: 'Page not found' };
        return page;
      })
      .catch(err => {
        throw err;
      });
  },
};
