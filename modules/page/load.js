const assert = require('assert');

module.exports = {
  exec({ $mongo: { $db } }, { slug, collection, domainId }) {
    assert(collection, 'Please provide a collection.');

    const query = { slug };
    if (domainId && domainId !== 'undefined') query.domainId = domainId;
    else query.$or = [{ domainId: { $exists: false } }, { domainId: { $eq: '' } }];

    return $db
      .collection(collection)
      .findOne(query)
      .then(page => {
        if (!page) return { status: 404, message: 'Page not found' };
        return page;
      })
      .catch(err => {
        throw err;
      });
  },
};
