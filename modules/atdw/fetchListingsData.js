const assert = require('assert');
const { get, forEach, uniq, map, find } = require('lodash');
const atdwFields = require('./atdwFields');
const filterMultimedia = require('./filterMultimedia');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db, $dbPub, $publish }, $logger }) {
    const chainPromises = listings => {
      let p = Promise.resolve();
      forEach(listings, listing => {
        p = p.then(() => fetchProductDetails($atdw, listing, listings, $logger, $dbPub, $db));
      });
      return p;
    };
    $logger.dev('fetching listings:');

    return loadListings($db)
      .then(listings => {
        $logger.dev('Done loading, got listings: ', listings.length);
        return chainPromises(listings)
          .then(() => Promise.all(map(listings, listing => updateProductServices($db, $dbPub, listing, listings, $logger))))
          .then(() => Promise.all(map(listings, listing => updateProductDetails($db, $publish, listing))))
          .then(() => Promise.resolve({ status: 200, message: 'Successfully updated Listings' }));
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
};

const loadListings = $db => {
  return $db
    .collection('listings')
    .find()
    .toArray();
};

const fetchProductDetails = ($atdw, listing, listings, $logger, $dbPub, $db) => {
  const { apiUrl, apiKey } = atdw;

  assert(apiUrl, 'Please provide an ATDW URL.');
  assert(apiKey, 'Please provide an ATDW API Key.');

  if (listing.listingType === 'service') return;

  const { _id } = listing;
  $logger.dev('fetching for:', listing.name.value);
  $logger.dev('fetching for:', listing._id);

  return (
    $atdw
      .$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${_id}`)
      .then(productData => {
        $logger.dev('Done fetching for:', productData.productId);
        forEach(atdwFields, (getFieldValue, fieldKey) => {
          if (fieldKey === 'image' || fieldKey === 'activeStatus') return;
          $logger.dev('Applying atdw field:', fieldKey);
          const property = listing[fieldKey];
          $logger.dev('Property:', property);
          if (!property || property.provider !== 'atdw') return;

          property.value = getFieldValue(productData, property.path);
          $logger.dev('Property value:', property.value);
        });

        listing.atdw = { ...listing.atdw, ...productData };
        listing.atdw.multimedia = filterMultimedia(productData.multimedia);
        listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);
        listing.hasFullATDWData = true;

        $logger.dev('listing atdw data added');
      })
      // TODO: if 404 set listing as removed in mongo
      .catch(err => {
        $logger.dev('got 404');
        $logger.error('FETCH LISTINGS DATA ERROR', err);

        const unpubServices = [];
        const updateServices = [];
        $logger.dev('fetchProductDetails -> listings', listings.length);
        forEach(listings, l => {
          if (l.parentId === listing._id) {
            updateServices.push({
              updateOne: {
                filter: { _id: l._id },
                update: { $set: { ...l, published: false } },
                upsert: true,
              },
            });
            unpubServices.push({
              deleteOne: {
                _id: l._id,
              },
            });
          }
        });
        $logger.dev('services to unpublish:', unpubServices && unpubServices.length);
        if (unpubServices.length) {
          return $db
            .collection('listings')
            .bulkWrite(updateServices, { ordered: false })
            .then(() => {
              return $dbPub
                .collection('listings')
                .bulkWrite(unpubServices, { ordered: false })
                .then(() => {
                  $logger.dev('services removed due to 404:', unpubServices.length);
                  // console.error(err);
                });
            });
        }
        $logger.dev('services removed due to 404:', unpubServices.length);
        // console.error(err);
      })
  );
};

const updateProductServices = ($db, $dbPub, listing, allListings, $logger) => {
  if (!(listing.atdw.productCategoryId === 'TOUR' && listing.atdw.services && listing.atdw.services.length)) return Promise.resolve();
  console.info('updating service details for listing ' + listing._id);
  return Promise.all(
    map(listing.atdw.services, s => {
      const service = createServiceListing(s, listing, allListings, $logger);
      return $db
        .collection('listings')
        .updateOne({ _id: service._id }, { $set: service }, { upsert: true })
        .then(() => {
          if (service.activeStatus.value === 'ACTIVE') {
            return $dbPub.collection('listings').updateOne({ _id: service._id }, { $set: service }, { upsert: true });
          } else if (service.activeStatus.value === 'INACTIVE') {
            return $dbPub.collection('listings').deleteOne({ _id: service._id });
          }
        });
    })
  );
};

const updateProductDetails = ($db, $publish, listing) => {
  if (listing.listingType === 'service') Promise.resolve();
  console.info('updating details for listing ' + listing._id);
  return $db
    .collection('listings')
    .updateOne({ _id: listing._id }, { $set: listing })
    .then(() => {
      if (listing.activeStatus.value === 'ACTIVE') {
        return $publish('listings', listing).then(() => {
          Promise.resolve();
        });
      } else {
        Promise.resolve();
      }
    });
  // .catch(err => console.error('update failed for ' + listing._id));
};

function createServiceListing(service, listing, allListings, $logger) {
  $logger.dev('creating service:', service.serviceName);
  $logger.dev('creating service:', service.serviceId);

  const foundService = find(allListings, l => l._id === service.serviceId);
  if (foundService) {
    $logger.dev('found service:', service.serviceName);
  }

  const _service = foundService || {
    _id: service.serviceId,
    name: { value: service.serviceName, path: 'serviceName', provider: 'atdw' },
    description: { value: service.serviceDescription, path: 'serviceDescription', provider: 'atdw' },
    parentId: listing._id,
    listingType: 'service',
    physicalAddress: service.physicalAddress || {
      value: '',
      path: 'physicalAddress',
      provider: 'atdw',
    },
    image: { value: get(service, 'serviceMultimedia[0].serverPath'), path: 'serviceMultimedia[0].serverPath', provider: 'atdw' },
    taggedCategories: { value: [], provider: '' },
    // atdwCategories: { value: listing.atdwCategories.value, provider: 'atdw' },
    customCategories: { value: [], provider: '' },
    multimedia: service.serviceMultimedia,
    // activeStatus: listing.activeStatus,
    atdw: {
      ...service,
      // addresses: listing.atdw.addresses,
      // externalSystems: listing.atdw.externalSystems,
      // status: listing.atdw.status,
      productImage: service.serviceMultimedia[0] && service.serviceMultimedia[0].serverPath,
      // productCategoryId: listing.atdw.productCategoryId,
    },
  };

  if (!_service.description) _service.description = { value: service.serviceDescription, path: 'serviceDescription', provider: 'atdw' };

  $logger.dev('Service description:', _service.description);

  _service.atdw.externalSystems = listing.atdw.externalSystems;
  _service.atdw.addresses = listing.atdw.addresses;
  if (listing.activeStatus.value === 'INACTIVE') {
    _service.activeStatus = listing.activeStatus;
  } else _service.activeStatus = _service.activeStatus || listing.activeStatus;

  _service.atdw.status = listing.atdw.status;
  _service.atdw.productCategoryId = listing.atdw.productCategoryId;
  _service.atdwCategories = { value: listing.atdwCategories.value, provider: 'atdw' };

  if (_service.activeStatus.value === 'ACTIVE') {
    _service.published = true;
    _service.lastPublished = new Date();
  }

  if (_service.physicalAddress.provider === 'atdw') {
    const address = find(_service.atdw.addresses, address => address.attributeIdAddress === 'PHYSICAL' || address.address_type === 'PHYSICAL');
    if (!address) return '';
    _service.physicalAddress.value = `${address.addressLine1 || address.address_line || ''}${address.addressLine1 || address.address_line ? ',' : ''} ${address.cityName ||
      address.city}, ${address.stateName || address.state}, ${address.countryName || address.country}`;
  }

  _service.taggedCategories.value = uniq([..._service.atdwCategories.value, ..._service.customCategories.value]);

  if (_service.name.provider === 'atdw') _service.name.value = service.serviceName;
  if (_service.description.provider === 'atdw') _service.description.value = service.serviceDescription;
  if (_service.taggedCategories.provider === 'atdw') _service.taggedCategories.value = listing.atdwCategories.value;

  $logger.dev('Service created:', service.serviceId);
  $logger.dev('Service created:', service.serviceName);

  return _service;
}
