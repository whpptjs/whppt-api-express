const { uniq } = require('lodash');
const { publishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $mongo: { $publish } }, params) {
    const { listing } = params;
    listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);

    return $publish('listings', listing).then(() => {
      if (!publishCallBack) return listing;
      listing.itemType = 'listing';
      return publishCallBack(listing).then(() => listing);
    });
  },
};
