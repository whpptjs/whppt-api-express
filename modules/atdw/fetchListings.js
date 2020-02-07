const assert = require('assert');
const { forEach, get, find } = require('lodash');
const URI = require('uri-js');

const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }) {
    const { apiUrl, apiKey, state = 'SA', area = 'Barossa', limit = '1000' } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

    const stringFromPath = function(product, path) {
      return get(product, path);
    };

    const atdwFields = {
      name: stringFromPath,
      description: stringFromPath,
      // Category: stringFromPath,
      email: function(product) {
        return find(product.communication, comm => comm.attributeIdCommunication === 'CAEMENQUIR');
      },
      physicalAddress: function(product) {
        return find(product.addresses, address => address.address_type === 'PHYSICAL');
      },
      postalAddress: function(product) {
        return find(product.addresses, address => address.address_type === 'POSTAL');
      },
      image: function(product) {
        const { scheme, host, path } = URI.parse(product.productImage);
        return `${scheme}://${host}${path}`;
      },
    };

    return Promise.all([
      $db
        .collection('listings')
        .find()
        .toArray(),
      $atdw.$get(`https://${apiUrl}/api/atlas/products?key=${apiKey}&out=json&st=${state}&ar=${area}&size=${limit}`),
    ])
      .then(([listings, atdwResults]) => {
        const { products } = atdwResults;
        forEach(products, product => {
          const foundListing = find(listings, l => l.atdw && l.atdw.productId === product.productId);
          const listing = foundListing || {
            _id: product.productId,
            name: {
              value: '',
              path: 'productName',
              provider: 'atdw',
            },
            description: {
              value: '',
              path: 'productDescription',
              provider: 'atdw',
            },
            physicalAddress: {
              value: '',
              path: 'physicalAddress',
              provider: 'atdw',
            },
            postalAddress: {
              value: '',
              path: 'postalAddress',
              provider: 'atdw',
            },
            email: {
              value: '',
              path: 'email',
              provider: 'atdw',
            },
          };
          if (!foundListing) listings.push(listing);

          listing.atdw = product;

          forEach(atdwFields, (getFieldValue, fieldKey) => {
            const property = listing[fieldKey];

            if (!property || property.provider !== 'atdw') return;
            property.value = getFieldValue(product, property.path);
          });
        });

        const listingOps = [];

        forEach(listings, listing => {
          listingOps.push({
            updateOne: {
              filter: { _id: listing._id },
              update: { $set: listing },
              upsert: true,
            },
          });
        });

        return Promise.all([$db.collection('listings').bulkWrite(listingOps, { ordered: false })]).then(() => {
          return Promise.resolve({ statusCode: 200, message: 'OK' });
        });
      })
      .catch(err => {
        console.error(err);
        throw new Error('Unable to update data from ATDW');
      });
  },
};
