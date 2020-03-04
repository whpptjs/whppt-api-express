const assert = require('assert');
const { forEach, find, uniq } = require('lodash');
const slugify = require('slugify');
const atdwFields = require('./atdwFields');

const { atdw, algoliaListingCallback } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }) {
    const { apiUrl, apiKey, state = 'SA', area = 'Barossa', limit = '1000' } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

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

          const listing = foundListing || defaultListing(product);

          if (!foundListing) listings.push(listing);

          listing.atdw = foundListing && foundListing.atdw ? { ...foundListing.atdw, ...product } : product;

          forEach(atdwFields, (getFieldValue, fieldKey) => {
            const property = listing[fieldKey];

            if (!property || property.provider !== 'atdw') return;
            property.value = getFieldValue(product, property.path) || property.value;
          });

          listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);
        });

        const listingOps = [];
        const pageOps = [];
        const configCallbackOps = [];

        forEach(listings, listing => {
          listing.slug = !listing.slug ? slugify(`listing/${listing.atdw.productName}`, { remove: '^[a-z](-?[a-z])*$', lower: true }) : listing.slug;
          const pageSlug = slugify(`listing/${listing.atdw.productName}`, { remove: '^[a-z](-?[a-z])*$', lower: true });

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
                  slug: pageSlug,
                  contents: [],
                  listingId: listing._id,
                  header: {
                    title: listing.atdw.productName,
                    breadcrumb: {
                      items: [
                        { type: 'page', href: '/', text: 'Home' },
                        { type: 'page', href: `/${pageSlug}`, text: listing.atdw.productName },
                      ],
                      property: 'items',
                    },
                  },
                  /* TODO: REMOVE LISTING OBJECT AT 1.0.0 RELEASE, BREAKING CHANGE */
                  listing: {
                    id: listing._id,
                  },
                  createdAt: new Date(),
                  template: 'listing',
                  link: { type: 'page' },
                  linkgroup: { type: 'page', links: [], showOnDesktop: true },
                },
              },
              upsert: true,
            },
          });

          if (algoliaListingCallback) configCallbackOps.push({ ...listing, slug: pageSlug, itemType: 'listing' });
        });

        const promises = [$db.collection('listings').bulkWrite([listingOps[0]], { ordered: false }), $db.collection('pages').bulkWrite([pageOps[0]], { ordered: false })];
        if (configCallbackOps.length) promises.push(algoliaListingCallback(configCallbackOps));

        return Promise.all(promises).then(() => Promise.resolve({ statusCode: 200, message: 'OK' }));
      })
      .catch(err => {
        console.error(err);
        throw new Error('Unable to update data from ATDW');
      });
  },
};

const defaultListing = product => ({
  _id: product.productId,
  name: {
    value: '',
    path: 'productName',
    provider: 'atdw',
  },
  listingType: 'product',
  description: {
    value: '',
    path: 'productDescription',
    provider: 'atdw',
  },
  activeStatus: {
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
  image: {
    value: '',
    path: 'productImage',
    provider: 'atdw',
  },
  phone: {
    value: '',
    path: 'phone',
    provider: 'atdw',
  },
  atdwCategories: {
    value: [],
    path: 'atdwCategories',
    provider: 'atdw',
  },
  customCategories: {
    value: [],
    path: 'customCategories',
    provider: '',
  },
  taggedCategories: {
    value: [],
    path: 'taggedCategories',
    provider: '',
  },
  hasFullATDWData: false,
});
