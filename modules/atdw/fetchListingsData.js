const assert = require('assert');
const URI = require('uri-js');
const { uniqBy } = require('lodash');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }) {
    const { apiUrl, apiKey } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

    return $db
      .collection('listings')
      .find()
      .toArray()
      .then(listings => {
        listings.forEach(listing => {
          return $atdw
            .$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${listing._id}`)
            .then(listingData => {
              const { multimedia } = listingData;
              listingData.multimedia = filterMultimedia(multimedia);

              const { _id } = listing;

              return $db
                .collection('listings')
                .findOne({ _id })
                .then(({ atdw }) => {
                  const updatedProduct = { ...atdw, ...listingData };
                  return $db
                    .collection('listings')
                    .updateOne({ _id }, { $set: { atdw: updatedProduct, hasFullATDWData: true } })
                    .then(() => {
                      return Promise.resolve({ statusCode: 200, message: 'OK' });
                    });
                })
                .catch(err => {
                  console.error(err.message);
                  throw new Error(err);
                });
            })
            .catch(err => {
              console.error(`Unable to update data from ATDW for product ${listing._id}`);
              throw new Error(err);
            });
        });
      });
  },
};

function filterMultimedia(multimedia) {
  multimedia.forEach(media => {
    const url = URI.parse(media.serverPath);
    media.serverPath = `${url.scheme}://${url.host}${url.path}`;
  });

  return uniqBy(multimedia, media => media.serverPath);
}
