const assert = require('assert');
const { uniq, forEach, map, find, get } = require('lodash');
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
          property.value = getFieldValue(listingData, property.path) || property.value;
        });

        listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);
        listing.atdw = { ...listing.atdw, ...listingData };
        listing.hasFullATDWData = true;

        return $db
          .collection('listings')
          .updateOne({ _id: id }, { $set: listing })
          .then(() => {
            if (listing.atdw.productCategoryId === 'TOUR' && listing.atdw.services && listing.atdw.services.length > 0) {
              const serviceIds = map(listing.atdw.services, s => {
                return s.serviceId;
              });

              return $db
                .collection('listings')
                .find({ _id: { $in: serviceIds } })
                .toArray()
                .then(serviceListings => {
                  const serviceOps = [];
                  forEach(listing.atdw.services, service => {
                    const foundService = find(serviceListings, s => s._id === service.serviceId);

                    const newService = foundService || {
                      _id: service.serviceId,
                      name: { value: service.serviceName, path: 'serviceName', provider: 'atdw' },
                      parentId: listing._id,
                      listingType: 'service',
                      image: { value: get(service, 'serviceMultimedia[0].serverPath'), path: 'serviceMultimedia[0].serverPath', provider: 'atdw' },
                      taggedCategories: { value: [], provider: '' },
                      atdwCategories: { value: listing.atdwCategories.value, provider: 'atdw' },
                      customCategories: { value: [], provider: '' },
                      multimedia: service.serviceMultimedia,
                      activeStatus: listing.activeStatus,
                      atdw: {
                        ...service,
                        status: listing.atdw.status,
                        productImage: service.serviceMultimedia[0] && service.serviceMultimedia[0].serverPath,
                        productCategoryId: listing.atdw.productCategoryId,
                      },
                    };

                    newService.taggedCategories.value = uniq([...newService.atdwCategories.value, ...newService.customCategories.value]);

                    if (newService.name.provider === 'atdw') newService.name.value = service.serviceName;
                    if (newService.taggedCategories.provider === 'atdw') newService.taggedCategories.value = listing.atdwCategories.value;

                    serviceOps.push({
                      updateOne: {
                        filter: { _id: newService._id },
                        update: { $set: newService },
                        upsert: true,
                      },
                    });
                  });

                  return $db
                    .collection('listings')
                    .bulkWrite(serviceOps, { ordered: false })
                    .then(() => {
                      return Promise.resolve({ statusCode: 200, message: 'OK' });
                    });
                });
            }
            return Promise.resolve({ statusCode: 200, message: 'OK' });
          });
      }
    );
  },
};
