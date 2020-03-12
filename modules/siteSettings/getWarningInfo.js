const { map } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, { _id }) {
    return $db
      .collection('pages')
      .find({ 'contents.categoryFilter._id': _id })
      .toArray()
      .then(result => {
        return map(result, page => {
          return page.slug;
        });
      })
      .catch(err => {
        throw err;
      });
  },
};
