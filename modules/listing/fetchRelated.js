const { toUpper, map, shuffle } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { categories, _id, limit = 6 } = query;

    const idQuery = {};
    idQuery['_id'] = {};
    idQuery['_id'].$ne = _id;

    const categoriesQuery = {};
    categoriesQuery['taggedCategories.value'] = {};
    categoriesQuery['taggedCategories.value'].$in = map(categories, c => {
      return toUpper(c.trim());
    });
    const toursQuery = {};
    toursQuery.$or = [{ 'atdw.productCategoryId': { $ne: 'TOUR' } }, { listingType: { $ne: 'product' } }];
    const parentQuery = {};
    parentQuery['parentId'] = {};
    parentQuery['parentId'].$ne = _id;

    return $db
      .collection('listings')
      .find({ ...categoriesQuery, ...toursQuery, ...parentQuery, ...idQuery })
      .toArray()
      .then(listings => {
        if (!listings.length || !listings.length) {
          return $db
            .collection('listings')
            .find({ ...idQuery, ...parentQuery, ...toursQuery })
            .toArray()
            .then(listings => {
              if (!listings || !listings.length) return { listings: [] };
              return { listings: shuffle(listings).slice(0, limit) };
            })
            .catch(err => {
              console.error(err);
              throw err;
            });
        }
        return { listings: shuffle(listings).slice(0, limit) };
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
