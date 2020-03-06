const assert = require('assert');
const { get, forEach, uniq, map } = require('lodash');
const atdwFields = require('./atdwFields');
const filterMultimedia = require('./filterMultimedia');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }) {
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
          .then(() => Promise.all(map(listings, listing => updateProductServices($db, listing))))
          .then(() => Promise.all(map(listings, listing => updateProductDetails($db, listing))));
      })
      .catch(err => {
        // TODO: if 404 set listing as removed in mongo
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

const fetchProductDetails = ($atdw, listing) => {
  const { apiUrl, apiKey } = atdw;

  assert(apiUrl, 'Please provide an ATDW URL.');
  assert(apiKey, 'Please provide an ATDW API Key.');

  if (listing.listingType === 'service') return;

  const { _id } = listing;
  return $atdw.$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${_id}`).then(productData => {
    forEach(atdwFields, (getFieldValue, fieldKey) => {
      const property = listing[fieldKey];
      if (!property || property.provider !== 'atdw') return;
      property.value = getFieldValue(productData, property.path);
    });

    listing.atdw = { ...listing.atdw, ...productData };
    listing.atdw.multimedia = filterMultimedia(productData.multimedia);
    listing.hasFullATDWData = true;
  });
};

const updateProductServices = ($db, listing) => {
  if (!(listing.atdw.productCategoryId === 'TOUR' && listing.atdw.services && listing.atdw.services.length)) return Promise.resolve();

  return Promise.all(
    map(listing.atdw.services, (s, index) => {
      const service = createServiceListing(s, listing);
      return $db.collection('listings').updateOne({ _id: service._id }, { $set: service }, { upsert: true });
    })
  );
};

const updateProductDetails = ($db, listing) => {
  return $db.collection('listings').updateOne({ _id: listing._id }, { $set: listing });
};

function createServiceListing(service, listing) {
  const _service = {
    _id: service.serviceId,
    name: { value: service.serviceName, path: 'serviceName', provider: 'atdw' },
    parentId: listing._id,
    slug: listing.slug,
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

  _service.taggedCategories.value = uniq([..._service.atdwCategories.value, ..._service.customCategories.value]);

  if (_service.name.provider === 'atdw') _service.name.value = service.serviceName;
  if (_service.taggedCategories.provider === 'atdw') _service.taggedCategories.value = listing.atdwCategories.value;
  return _service;
}

// return $db
//   .collection('listings')
//   .find()
//   .toArray()
//   .then(listings => {
//     // return Promise.all(map(listings, listing => {})); // solution for async loop
//     listings.forEach(listing => {
//       return $atdw
//         .$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${listing._id}`)
//         .then(listingData => {
//           const { multimedia } = listingData;
//           listingData.multimedia = filterMultimedia(multimedia);
//
//           const { _id } = listing;
//
//           return $db
//             .collection('listings')
//             .findOne({ _id })
//             .then(({ atdw }) => {
//               const updatedProduct = { ...atdw, ...listingData };
//               return $db
//                 .collection('listings')
//                 .updateOne({ _id }, { $set: { atdw: updatedProduct, hasFullATDWData: true } })
//                 .then(() => {
//                   return Promise.resolve({ statusCode: 200, message: 'OK' });
//                 });
//             })
//             .catch(err => {
//               console.error(err.message);
//               throw new Error(err);
//             });
//         })
//         .catch(err => {
//           console.error(`Unable to update data from ATDW for product ${listing._id}`);
//           throw new Error(err);
//         });
//     });
//   });

// return $db
//   .collection('listings')
//   .find()
//   .toArray()
//   .then(listings => {
//     // return Promise.all(map(listings, listing => {})); // solution for async loop
//     listings.forEach(listing => {
//       return $atdw
//         .$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${listing._id}`)
//         .then(listingData => {
//           const { multimedia } = listingData;
//           listingData.multimedia = filterMultimedia(multimedia);
//
//           const { _id } = listing;
//
//           return $db
//             .collection('listings')
//             .findOne({ _id })
//             .then(({ atdw }) => {
//               const updatedProduct = { ...atdw, ...listingData };
//               return $db
//                 .collection('listings')
//                 .updateOne({ _id }, { $set: { atdw: updatedProduct, hasFullATDWData: true } })
//                 .then(() => {
//                   return Promise.resolve({ statusCode: 200, message: 'OK' });
//                 });
//             })
//             .catch(err => {
//               console.error(err.message);
//               throw new Error(err);
//             });
//         })
//         .catch(err => {
//           console.error(`Unable to update data from ATDW for product ${listing._id}`);
//           throw new Error(err);
//         });
//     });
//   });

// const assert = require('assert');
// const { uniq, forEach } = require('lodash');
// const atdwFields = require('./atdwFields');
// const filterMultimedia = require('./filterMultimedia');
//
// // Whppt Config
// const { atdw } = require(`${process.cwd()}/whppt.config.js`);
//
// module.exports = {
//   exec({ $atdw, $mongo: { $db } }, { limit }) {
//     const { apiUrl, apiKey } = atdw;
//
//     assert(apiUrl, 'Please provide an ATDW URL.');
//     assert(apiKey, 'Please provide an ATDW API Key.');
//
//     return $db
//       .collection('listings')
//       .find()
//       .limit(Number(limit))
//       .toArray()
//       .then(listings => {
//         const ops = [];
//
//         const listingPromises = listings.map(listing => {
//           const { _id } = listing;
//           return $atdw.$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${_id}`).then(listingData => {
//             forEach(atdwFields, (getFieldValue, fieldKey) => {
//               const property = listing[fieldKey];
//
//               if (!property || property.provider !== 'atdw') return;
//               property.value = getFieldValue(listingData, property.path);
//             });
//             const { multimedia } = listingData;
//             listingData.multimedia = filterMultimedia(multimedia);
//
//             listing.taggedCategories.value = uniq([...listing.atdwCategories.value, ...listing.customCategories.value]);
//             listing.atdw = { ...atdw, ...listingData };
//             listing.hasFullATDWData = true;
//
//             ops.push({
//               updateOne: {
//                 filter: { _id },
//                 update: {
//                   $set: listing,
//                 },
//               },
//             });
//           });
//         });
//
//         return Promise.all(listingPromises).then(() => {
//           return $db
//             .collection('listings')
//             .bulkWrite(ops, { ordered: false })
//             .then(() => {
//               return Promise.resolve({ statusCode: 200, message: 'OK' });
//             });
//         });
//       })
//       .catch(err => {
//         console.error(`Unable to update data from ATDW for product`);
//         throw new Error(err);
//       });
//   },
// };
//
// // return $db
// //   .collection('listings')
// //   .find()
// //   .toArray()
// //   .then(listings => {
// //     // return Promise.all(map(listings, listing => {})); // solution for async loop
// //     listings.forEach(listing => {
// //       return $atdw
// //         .$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${listing._id}`)
// //         .then(listingData => {
// //           const { multimedia } = listingData;
// //           listingData.multimedia = filterMultimedia(multimedia);
// //
// //           const { _id } = listing;
// //
// //           return $db
// //             .collection('listings')
// //             .findOne({ _id })
// //             .then(({ atdw }) => {
// //               const updatedProduct = { ...atdw, ...listingData };
// //               return $db
// //                 .collection('listings')
// //                 .updateOne({ _id }, { $set: { atdw: updatedProduct, hasFullATDWData: true } })
// //                 .then(() => {
// //                   return Promise.resolve({ statusCode: 200, message: 'OK' });
// //                 });
// //             })
// //             .catch(err => {
// //               console.error(err.message);
// //               throw new Error(err);
// //             });
// //         })
// //         .catch(err => {
// //           console.error(`Unable to update data from ATDW for product ${listing._id}`);
// //           throw new Error(err);
// //         });
// //     });
// //   });
