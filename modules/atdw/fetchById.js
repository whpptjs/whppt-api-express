// const assert = require('assert');
// const { uniqBy } = require('lodash');
// const URI = require('uri-js');
// const COLLECTIONS = require('../../COLLECTIONS');
//
module.exports = {
  exec({ $atdw, $mongo }, { query }) {
    //     const { id } = query;
    //     assert(id, 'Please provide a product ID');
    //
    //     const { ATDW_API_URL: atdwApiUrl, ATDW_API_KEY: atdwKey } = process.env;
    //
    //     return $atdw
    //       .$get(`https://${atdwApiUrl}/api/atlas/product?key=${atdwKey}&out=json&productId=${id}`)
    //       .then(eventData => {
    //         const { multimedia } = eventData;
    //         eventData.multimedia = filterMultimedia(multimedia);
    //
    //         return $mongo.then(({ db }) => {
    //           return db
    //             .collection(COLLECTIONS.PRODUCTS)
    //             .findOne({ _id: id })
    //             .then(({ atdw }) => {
    //               const updatedProduct = { ...atdw, ...eventData };
    //               return db
    //                 .collection(COLLECTIONS.PRODUCTS)
    //                 .updateOne({ _id: id }, { $set: { atdw: updatedProduct } })
    //                 .then(() => {
    //                   return Promise.resolve({ statusCode: 200, message: 'OK' });
    //                 });
    //             });
    //         });
    //       })
    //       .catch(err => {
    //         console.error(err);
    //         throw new Error(`Unable to update data from ATDW for product ${id}`);
    //       });
  },
};
//
// function filterMultimedia(multimedia) {
//   // trim query params from existing urls
//   multimedia.forEach(media => {
//     const url = URI.parse(media.serverPath);
//     media.serverPath = `${url.scheme}://${url.host}${url.path}`;
//   });
//
//   // filter out duplicates
//   return uniqBy(multimedia, media => media.serverPath);
// }
