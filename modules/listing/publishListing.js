const { uniq } = require('lodash');

module.exports = {
  exec({ $mongo: { $publish } }, params) {
    const { listing } = params;
    console.log('exec -> listing', listing);
    listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);

    return $publish('listings', listing).then(() => {
      // return $fetch('pages', listing._id).then(page => {
      //   return $publish('pages', page);
      // });
    });
  },
};
