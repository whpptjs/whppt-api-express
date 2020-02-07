const { isEmpty, toUpper, map } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { categories, filters, limit = 6, currentPage = 1 } = query;

    const categoryFilters = categories
      ? {
          'atdw.productCategoryId': {
            $in: map(categories, c => {
              return toUpper(c);
            }),
          },
        }
      : {};

    const listingsQuery = {};

    if (filters && !isEmpty(filters)) listingsQuery['atdw.startDate'] = {};
    if (filters && filters.from) listingsQuery['atdw.startDate'].$gte = filters.from;
    if (filters && filters.to) listingsQuery['atdw.startDate'].$lte = filters.to;

    const listings = $db
      .collection('listings')
      .find({ ...listingsQuery, ...categoryFilters })
      .skip(limit * (currentPage - 1))
      .limit(limit);

    return Promise.all([listings.toArray(), listings.count()]).then(([listings, totalListings]) => {
      return { listings, totalListings };
    });
  },
};
