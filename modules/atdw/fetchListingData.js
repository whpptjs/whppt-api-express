const assert = require('assert');
const { uniq, forEach } = require('lodash');
const atdwFields = require('./atdwFields');
const filterMultimedia = require('./filterMultimedia');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }, query) {
    const { id } = query;
    assert(id, 'Please provide a Listing ID');

    const { apiUrl, apiKey } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

    return Promise.all([$atdw.$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${id}`), $db.collection('listings').findOne({ _id: id })]).then(
      ([listingData, listing]) => {
        const { multimedia } = listingData;
        listingData.multimedia = filterMultimedia(multimedia);

        // bit of repetitive code here, refactor into own function
        forEach(atdwFields, (getFieldValue, fieldKey) => {
          const property = listing[fieldKey];

          if (!property || property.provider !== 'atdw') return;
          property.value = getFieldValue(listingData, property.path);
        });

        listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);
        listing.atdw = { ...listing.atdw, ...listingData };
        listing.hasFullATDWData = true;

        return $db
          .collection('listings')
          .updateOne({ _id: id }, { $set: listing })
          .then(() => {
            if (listing.atdw.productCategoryId === 'TOUR' && listing.atdw.services && listing.atdw.services.length > 0) {
              const serviceOps = [];
              forEach(listing.atdw.services, service => {
                const newService = {
                  _id: service.serviceId,
                  name: { value: service.serviceName, path: 'serviceName', provider: 'atdw' },
                  isService: true,
                  parentId: listing._id,
                  slug: listing.slug,
                  taggedCategories: listing.taggedCategories,
                  multimedia: service.serviceMultimedia,
                  atdw: { ...service, productImage: service.serviceMultimedia[0] && service.serviceMultimedia[0].serverPath },
                };
                serviceOps.push({
                  updateOne: {
                    filter: { _id: newService._id },
                    update: { $set: newService },
                    upsert: true,
                  },
                });
              });

              console.log('TCL: exec -> serviceOps', serviceOps);

              return $db
                .collection('listings')
                .bulkWrite(serviceOps, { ordered: false })
                .then(() => {
                  return Promise.resolve({ statusCode: 200, message: 'OK' });
                });
            }
            return Promise.resolve({ statusCode: 200, message: 'OK' });
          });
      }
    );
  },
};
