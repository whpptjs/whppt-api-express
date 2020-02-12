const { isEmpty, toUpper, map, forEach } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { categoryFilterId, filters, limit = 6, currentPage = 1 } = query;

    const categoryQuery = {};
    const listingsQuery = {};

    if (filters && !isEmpty(filters)) listingsQuery['atdw.startDate'] = {};
    if (filters && filters.from) listingsQuery['atdw.startDate'].$gte = filters.from;
    if (filters && filters.to) listingsQuery['atdw.startDate'].$lte = filters.to;

    if (categoryFilterId) {
      return $db
        .collection('categories')
        .findOne({ id: categoryFilterId })
        .then(category => {
          categoryQuery.$and = [];
          forEach(category.filters, orFilter =>
            categoryQuery.$and.push({
              'taggedCategories.value': {
                $in: map(orFilter, or => {
                  return toUpper(or.trim());
                }),
              },
            })
          );

          const listings = $db
            .collection('listings')
            .find({ ...listingsQuery, ...categoryQuery })
            .skip(limit * (currentPage - 1))
            .limit(limit);

          return Promise.all([listings.toArray(), listings.count()]).then(([listings, totalListings]) => {
            return { listings, totalListings };
          });
        })
        .catch(err => {
          console.error(err);
          throw err;
        });
    } else {
      const listings = $db
        .collection('listings')
        .find({ ...listingsQuery })
        .skip(limit * (currentPage - 1))
        .limit(limit);

      return Promise.all([listings.toArray(), listings.count()]).then(([listings, totalListings]) => {
        return { listings, totalListings };
      });
    }
  },
};
