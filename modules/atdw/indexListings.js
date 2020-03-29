const { map, forEach, find } = require('lodash');

const { listingCallback } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $axios, $mongo: { $db, $dbPub } }) {
    return Promise.all([
      $dbPub
        .collection('listings')
        .find()
        .toArray(),
      $dbPub
        .collection('pages')
        .find({ template: 'listing' })
        .toArray(),
    ]).then(([listings, pages]) => {
      console.log('exec -> listings', listings.length);
      const listingOps = [];
      forEach(listings, listing => {
        let page = {};
        if (listing.listingType === 'service') {
          page = find(pages, p => p._id === listing.parentId);
        } else page = page = find(pages, p => p._id === listing._id);

        listingOps.push({ ...listing, slug: page.slug, itemType: 'listing' });
      });

      // return Promise.resolve({ statusCode: 200, message: 'OK' });
      return listingCallback(listingOps).then(() => Promise.resolve({ statusCode: 200, message: 'OK' }));
    });
  },
};
