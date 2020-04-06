const { uniq } = require('lodash');

module.exports = {
  exec({ $id, $mongo: { $save } }, params) {
    const { listing } = params;
    listing._id = listing._id || $id();
    if (!listing.isCustom) listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);
    if (listing.isCustom) listing.taggedCategories.value = uniq([...listing.customCategories.value]);
    return $save('listings', listing).then(() => {
      return listing;
    });
  },
};
