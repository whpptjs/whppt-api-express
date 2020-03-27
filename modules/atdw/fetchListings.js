const { forEach, find, uniq } = require('lodash');
const slugify = require('slugify');
const atdwFields = require('./atdwFields');

const { atdw, listingCallback } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db, $dbPub } }) {
    const { apiUrl, apiKey, state = 'SA', area = 'Barossa', limit = '1000' } = atdw;

    return Promise.all([
      $db
        .collection('listings')
        .find({ listingType: 'product' })
        .toArray(),
      $db
        .collection('pages')
        .find({ template: 'listing' })
        .toArray(),
      $atdw.$get(`https://${apiUrl}/api/atlas/products?key=${apiKey}&out=json&st=${state}&ar=${area}&size=${limit}`),
    ]).then(([listings, pages, atdwResults]) => {
      let { products } = atdwResults;

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
      const publishListingOps = [];
      const pageOps = [];
      const pubPageOps = [];
      const unpubItems = [];
      const configCallbackOps = [];

      forEach(listings, listing => {
        if (!find(products, p => p.productId === listing._id) && listing.activeStatus.value === 'ACTIVE') {
          listing.activeStatus.value = 'INACTIVE';
          listing.published = false;
          unpubItems.push({
            deleteOne: {
              _id: listing._id,
            },
          });
        }

        const foundPage = find(pages, p => p._id === (listing.atdw && listing.atdw.productId));

        let pageSlug = foundPage ? foundPage.slug : `listing/${slugify(listing.atdw.productName, { remove: '^[a-z](-?[a-z])*$', lower: true, strict: true })}`;

        pageSlug = pageSlug.replace(/[#?]/g, '');

        if (listing.activeStatus.value === 'ACTIVE') {
          listing.published = true;
          listing.lastPublished = new Date();

          publishListingOps.push({
            updateOne: {
              filter: { _id: listing._id },
              update: {
                $set: listing,
              },
              upsert: true,
            },
          });

          if (listingCallback) configCallbackOps.push({ ...listing, slug: pageSlug, itemType: 'listing' });
        }

        listingOps.push({
          updateOne: {
            filter: { _id: listing._id },
            update: { $set: listing },
            upsert: true,
          },
        });

        const newPage = foundPage
          ? { ...foundPage, published: listing.activeStatus.value === 'ACTIVE' ? true : false }
          : {
              _id: listing._id,
              slug: pageSlug,
              pageType: 'listing',
              published: true,
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
              og: { title: listing.atdw.productName, keywords: '', image: { imageId: '', crop: {} } },
              twitter: { title: listing.atdw.productName, keywords: '', image: { imageId: '', crop: {} } },
              link: { type: 'page' },
              linkgroup: { type: 'page', links: [], showOnDesktop: true },
            };

        pageOps.push({
          updateOne: {
            filter: { _id: listing._id },
            update: {
              $set: newPage,
            },
            upsert: true,
          },
        });

        if (newPage.published) {
          pubPageOps.push({
            updateOne: {
              filter: { _id: listing._id },
              update: {
                $set: newPage,
              },
              upsert: true,
            },
          });
        }
      });

      const promises = [$db.collection('listings').bulkWrite(listingOps, { ordered: false })];

      if (pageOps && pageOps.length) {
        promises.push($db.collection('pages').bulkWrite(pageOps, { ordered: false }));
      }

      if (pubPageOps && pubPageOps.length) {
        promises.push($dbPub.collection('pages').bulkWrite(pubPageOps, { ordered: false }));
      }

      if (publishListingOps && publishListingOps.length) {
        promises.push($dbPub.collection('listings').bulkWrite(publishListingOps, { ordered: false }));
      }

      if (unpubItems && unpubItems.length) {
        promises.push($dbPub.collection('pages').bulkWrite(unpubItems, { ordered: false }));
        promises.push($dbPub.collection('listings').bulkWrite(unpubItems, { ordered: false }));
      }

      // if (configCallbackOps.length) promises.push(listingCallback(configCallbackOps));

      return Promise.all(promises).then(() => Promise.resolve({ statusCode: 200, message: 'OK' }));
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
