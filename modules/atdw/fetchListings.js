const assert = require('assert');
const { map, camelCase, lowerCase, forEach, get, find } = require('lodash');
const URI = require('uri-js');
const slugify = require('slugify');

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
      status: stringFromPath,
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
      taggedCategories: function(product) {
        const tags = map(product.verticalClassifications, category => category.productTypeId);
        tags.push(product.productCategoryId);

        return tags;
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
            status: {
              value: '',
              path: 'status',
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
            taggedCategories: {
              value: [],
              path: 'taggedCategories',
              provider: 'atdw',
            },
            hasFullATDWData: false,
          };
          if (!foundListing) listings.push(listing);

          listing.atdw = foundListing && foundListing.atdw ? { ...foundListing.atdw, ...product } : product;

          forEach(atdwFields, (getFieldValue, fieldKey) => {
            const property = listing[fieldKey];

            if (!property || property.provider !== 'atdw') return;
            property.value = getFieldValue(product, property.path);
          });
        });

        const listingOps = [];
        const pageOps = [];

        forEach(listings, listing => {
          listing.slug = listing.atdw ? slugify(`listing/${listing.name.value}`, { remove: '^[a-z](-?[a-z])*$', lower: true }) : '';

          listingOps.push({
            updateOne: {
              filter: { _id: listing._id },
              update: { $set: listing },
              upsert: true,
            },
          });

          pageOps.push({
            updateOne: {
              filter: { _id: listing._id },
              update: {
                $set: {
                  _id: listing._id,
                  slug: slugify(`listing/${listing.atdw.productName}`, { remove: '^[a-z](-?[a-z])*$', lower: true }),
                  // slug: `${lowerCase(listing.atdw.productCategoryId)}/${camelCase(listing.atdw.productName)}`,
                  contents: [],
                  listing: {
                    id: listing._id,
                  },
                  header: { title: listing.atdw.productName },
                  createdAt: new Date(),
                  template: 'listing',
                  link: { type: 'page' },
                  linkgroup: { type: 'page', links: [], showOnDesktop: true },
                },
              },
              upsert: true,
            },
          });
        });

        return Promise.all([$db.collection('listings').bulkWrite(listingOps, { ordered: false }), $db.collection('pages').bulkWrite(pageOps, { ordered: false })]).then(() => {
          return Promise.resolve({ statusCode: 200, message: 'OK' });
        });
      })
      .catch(err => {
        console.error(err);
        throw new Error('Unable to update data from ATDW');
      });
  },
};
