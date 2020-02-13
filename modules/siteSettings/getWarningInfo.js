const { map } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, { id }) {
    return $db
      .collection('pages')
      .find({ 'contents.categoryFilter.id': id })
      .toArray()
      .then(result => {
        console.log('TCL: exec -> result', result);
        return map(result, page => {
          return page.slug;
        });
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
