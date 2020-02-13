const { toUpper, map, shuffle } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { categories, _id, limit = 6 } = query;

    const categoriesQuery = {};
    categoriesQuery['_id'] = {};
    categoriesQuery['_id'].$ne = _id;
    categoriesQuery['taggedCategories.value'] = {};
    categoriesQuery['taggedCategories.value'].$in = map(categories, c => {
      return toUpper(c.trim());
    });

    return $db
      .collection('listings')
      .find(categoriesQuery)
      .toArray()
      .then(listings => {
        return { listings: shuffle(listings).slice(0, limit) };
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
