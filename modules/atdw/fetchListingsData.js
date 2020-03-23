const assert = require('assert');
const { get, forEach, uniq, map, find } = require('lodash');
const atdwFields = require('./atdwFields');
const filterMultimedia = require('./filterMultimedia');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db, $dbPub, $publish } }) {
    const chainPromises = listings => {
      let p = Promise.resolve();
      forEach(listings, listing => {
        p = p.then(() => fetchProductDetails($atdw, listing));
      });
      return p;
    };

    return loadListings($db)
      .then(listings => {
        return chainPromises(listings)
          .then(() => Promise.all(map(listings, listing => updateProductServices($db, $dbPub, listing, listings))))
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
    .find({ $or: [{ 'atdw.productCategoryId': 'TOUR' }, { listingType: 'service' }] })
    .toArray();
};

const fetchProductDetails = ($atdw, listing) => {
  let { apiUrl, apiKey } = atdw;
  apiUrl = 'atlas.atdw-online.com.au';
  apiKey = '30be57ce27f84465bde566c2c908f978';
  assert(apiUrl, 'Please provide an ATDW URL.');
  assert(apiKey, 'Please provide an ATDW API Key.');

  if (listing.listingType === 'service') return;

  const { _id } = listing;
  return (
    $atdw
      .$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${_id}`)
      .then(productData => {
        forEach(atdwFields, (getFieldValue, fieldKey) => {
          if (fieldKey === 'image' || fieldKey === 'activeStatus') return;

          const property = listing[fieldKey];
          if (!property || property.provider !== 'atdw') return;

          property.value = getFieldValue(productData, property.path);
        });

        listing.atdw = { ...listing.atdw, ...productData };
        listing.atdw.multimedia = filterMultimedia(productData.multimedia);
        listing.hasFullATDWData = true;
      })
      // TODO: if 404 set listing as removed in mongo
      .catch(err => console.error(err))
  );
};

const updateProductServices = ($db, $dbPub, listing, allListings) => {
  if (!(listing.atdw.productCategoryId === 'TOUR' && listing.atdw.services && listing.atdw.services.length)) return Promise.resolve();
  console.info('updating service details for listing' + listing._id);
  return Promise.all(
    map(listing.atdw.services, s => {
      const service = createServiceListing(s, listing, allListings);
      return $db
        .collection('listings')
        .updateOne({ _id: service._id }, { $set: service }, { upsert: true })
        .then(() => {
          if (service.published === true) {
            return $dbPub.collection('listings').updateOne({ _id: service._id }, { $set: service }, { upsert: true });
          }
        });
    })
  );
};

const updateProductDetails = ($db, $publish, listing) => {
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

function createServiceListing(service, listing, allListings) {
  const foundService = find(allListings, l => l._id === service.serviceId);

  const _service = foundService || {
    _id: service.serviceId,
    name: { value: service.serviceName, path: 'serviceName', provider: 'atdw' },
    parentId: listing._id,
    listingType: 'service',
    physicalAddress: service.physicalAddress || {
      value: '',
      path: 'physicalAddress',
      provider: 'atdw',
    },
    image: { value: get(service, 'serviceMultimedia[0].serverPath'), path: 'serviceMultimedia[0].serverPath', provider: 'atdw' },
    taggedCategories: { value: [], provider: '' },
    atdwCategories: { value: listing.atdwCategories.value, provider: 'atdw' },
    customCategories: { value: [], provider: '' },
    multimedia: service.serviceMultimedia,
    activeStatus: listing.activeStatus,
    atdw: {
      ...service,
      addresses: listing.atdw.addresses,
      status: listing.atdw.status,
      productImage: service.serviceMultimedia[0] && service.serviceMultimedia[0].serverPath,
      productCategoryId: listing.atdw.productCategoryId,
    },
  };

  if (_service.activeStatus.value === 'ACTIVE') {
    _service.published = true;
    _service.lastPublished = new Date();
  }

  if (_service.physicalAddress.provider === 'atdw') {
    const address = find(_service.atdw.addresses, address => address.attributeIdAddress === 'PHYSICAL' || address.address_type === 'PHYSICAL');
    if (!address) return '';
    _service.physicalAddress.value = `${address.addressLine1 || address.address_line}, ${address.cityName || address.city}, ${address.stateName ||
      address.state}, ${address.countryName || address.country}`;
  }

  _service.taggedCategories.value = uniq([..._service.atdwCategories.value, ..._service.customCategories.value]);

  if (_service.name.provider === 'atdw') _service.name.value = service.serviceName;
  if (_service.taggedCategories.provider === 'atdw') _service.taggedCategories.value = listing.atdwCategories.value;
  return _service;
}
