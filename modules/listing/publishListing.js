const { uniq, forEach } = require('lodash');
const { publishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $mongo: { $publish, $db } }, params) {
    const { listing } = params;
    listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);
    listing.activeStatus.value = 'ACTIVE';
    const promises = [$publish('listings', listing)];
    if (listing.atdw.services && listing.atdw.services.length) {
      return $db
        .collection('listings')
        .find({ parentId: listing._id })
        .toArray()
        .then(services => {
          console.log('exec -> services.length', services.length);
          forEach(services, service => promises.push($publish('listings', service)));

          return Promise.all(promises).then(() => {
            if (!publishCallBack) return listing;

            return $db
              .collection('pages')
              .findOne({
                _id: listing._id,
              })
              .then(page => {
                listing.itemType = 'listing';
                listing.slug = page.slug;
                const publishPromises = [publishCallBack(listing)];
                forEach(services, service => {
                  service.itemType = 'listing';
                  service.slug = page.slug;
                  publishPromises.push(publishCallBack(service));
                });
                // return
                return Promise.all(publishPromises);
              });
          });
        });
    }

    return Promise.all(promises).then(() => {
      if (!publishCallBack) return listing;

      return $db
        .collection('pages')
        .findOne({ _id: listing._id })
        .then(page => {
          listing.itemType = 'listing';
          listing.slug = page.slug;
          // return
          return publishCallBack(listing);
        });
    });
  },
};
