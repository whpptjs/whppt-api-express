const { uniq } = require('lodash');

module.exports = {
  exec({ $mongo: { $save } }, params) {
    const { listing } = params;
    listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);

    return $save('listings', listing);
  },
};
