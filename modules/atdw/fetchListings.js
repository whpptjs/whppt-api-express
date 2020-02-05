const assert = require('assert');
const URI = require('uri-js');

const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }) {
    const { apiUrl, apiKey, state = 'SA', area = 'Barossa', limit = '1000' } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

    return $atdw
      .$get(`https://${apiUrl}/api/atlas/products?key=${apiKey}&out=json&st=${state}&ar=${area}&size=${limit}`)
      .then(({ products }) => {
        const listingOps = [];

        products.forEach(product => {
          const _id = product.productId;

          const { scheme, host, path } = URI.parse(product.productImage);
          product.productImage = `${scheme}://${host}${path}`;

          listingOps.push({
            updateOne: {
              filter: { _id },
              update: { $set: { _id, atdw: product } },
              upsert: true,
            },
          });
        });

        return Promise.all([$db.collection('listings').bulkWrite(listingOps, { ordered: false })]).then(() => {
          return Promise.resolve({ statusCode: 200, message: 'OK' });
        });
      })
      .catch(err => {
        console.error(err.message);
        throw new Error('Unable to update data from ATDW');
      });
  },
};
