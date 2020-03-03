const assert = require('assert');
const { forEach } = require('lodash');
const atdwFields = require('./atdwFields');
const filterMultimedia = require('./filterMultimedia');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  async exec({ $atdw, $mongo: { $db } }) {
    const { apiUrl, apiKey } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

    try {
      const listings = await $db
        .collection('listings')
        .find()
        .toArray();

      for (const listing of listings) {
        const originalListing = listing;

        const { _id } = listing;
        const listingData = await $atdw.$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${_id}`);

        forEach(atdwFields, (getFieldValue, fieldKey) => {
          const property = listing[fieldKey];

          if (!property || property.provider !== 'atdw') return;
          property.value = getFieldValue(listingData, property.path);
        });

        const { multimedia } = listingData;
        listingData.multimedia = await filterMultimedia(multimedia);

        // Need to merge original with new data here...
        listing.atdw = { ...originalListing.atdw, ...listingData };
        listing.hasFullATDWData = true;

        await $db.collection('listings').updateOne({ _id }, { $set: listing });
      }

      return Promise.resolve({ statusCode: 200, message: 'OK' });
    } catch (err) {
      console.error(`Unable to update data from ATDW for product`);
      throw new Error(err);
    }
  },
};

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
