const { uniqBy } = require('lodash');
const URI = require('uri-js');
// const COLLECTIONS = require('../../COLLECTIONS');

module.exports = {
  exec({ $atdw, $mongo }) {
    // const { ATDW_API_URL: atdwApiUrl, ATDW_API_KEY: atdwKey } = process.env;
    //
    // return $mongo.then(({ db }) => {
    //   db.collection(COLLECTIONS.PRODUCTS)
    //     .find()
    //     .toArray()
    //     .then(products => {
    //       products.forEach(product => {
    //         return $atdw
    //           .$get(`https://${atdwApiUrl}/api/atlas/product?key=${atdwKey}&out=json&productId=${product._id}`)
    //           .then(eventData => {
    //             const { multimedia } = eventData;
    //             eventData.multimedia = filterMultimedia(multimedia);
    //
    //             return db
    //               .collection(COLLECTIONS.PRODUCTS)
    //               .findOne({ _id: product._id })
    //               .then(({ atdw }) => {
    //                 const updatedProduct = { ...atdw, ...eventData };
    //                 return db
    //                   .collection(COLLECTIONS.PRODUCTS)
    //                   .updateOne({ _id: product._id }, { $set: { atdw: updatedProduct } })
    //                   .then(() => {
    //                     return Promise.resolve({ statusCode: 200, message: 'OK' });
    //                   });
    //               })
    //               .catch(err => {
    //                 console.error(err.message);
    //                 throw new Error(err);
    //               });
    //           })
    //           .catch(err => {
    //             console.error(`Unable to update data from ATDW for product ${product._id}`);
    //             throw new Error(err);
    //           });
    //       });
    //     });
    // });
  },
};

function filterMultimedia(multimedia) {
  multimedia.forEach(media => {
    const url = URI.parse(media.serverPath);
    media.serverPath = `${url.scheme}://${url.host}${url.path}`;
  });

  return uniqBy(multimedia, media => media.serverPath);
}

/*
exec({ $atdw, $mongo }) {
  const { ATDW_API_URL: atdwApiUrl, ATDW_API_KEY: atdwKey } = process.env;

  return $mongo.then(({ db }) => {
    return db
      .collection(COLLECTIONS.PRODUCTS)
      .find()
      .toArray()
      .then(products => {
        const atdwReqs = [];

        products.forEach(product => {
          atdwReqs.push(
            $atdw.$get(`https://${atdwApiUrl}/api/atlas/product?key=${atdwKey}&out=json&productId=${product._id}`)
          );
        });

        return Promise.all(atdwReqs)
          .then(details => {
            const ops = [];

            details.forEach(det => {
              const { multimedia } = det;
              det.multimedia = filterMultimedia(multimedia);

              const original = find(products, p => p._id === det.productId);
              const updatedProduct = { ...original.atdw, ...det };

              ops.push({
                updateOne: {
                  filter: { _id: det.productId },
                  update: { $set: { _id: details.productId, atdw: updatedProduct } },
                },
              });
            });

            return db
              .collection(COLLECTIONS.PRODUCTS)
              .bulkWrite(ops, { ordered: false })
              .then(() => {
                return Promise.resolve({ ops, statusCode: 200, message: 'OK' });
              });
          })
          .catch(err => console.error(err));
      });
  });
},
*/
