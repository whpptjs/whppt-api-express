const { isEmpty } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { category, filters, limit = 6, currentPage = 1 } = query;
    const listingsQuery = category ? { 'atdw.productCategoryId': category } : {};

    if (filters && !isEmpty(filters)) listingsQuery['atdw.startDate'] = {};
    if (filters && filters.from) listingsQuery['atdw.startDate'].$gte = filters.from;
    if (filters && filters.to) listingsQuery['atdw.startDate'].$lte = filters.to;

    const listings = $db
      .collection('listings')
      .find(listingsQuery)
      .skip(limit * (currentPage - 1))
      .limit(limit);

    return Promise.all([listings.toArray(), listings.count()]).then(([listings, totalListings]) => {
      return { listings, totalListings };
    });
  },
};
