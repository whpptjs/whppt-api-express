const assert = require('assert');
const { uniqBy } = require('lodash');
const URI = require('uri-js');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }, query) {
    const { id } = query;
    assert(id, 'Please provide a Listing ID');

    const { apiUrl, apiKey } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

    return $atdw
      .$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${id}`)
      .then(listingData => {
        const { multimedia } = listingData;
        listingData.multimedia = filterMultimedia(multimedia);

        return $db
          .collection('listings')
          .findOne({ _id: id })
          .then(({ atdw }) => {
            const updatedListing = { ...atdw, ...listingData };

            return $db
              .collection('listings')
              .updateOne({ _id: id }, { $set: { atdw: updatedListing } })
              .then(() => {
                return Promise.resolve({ statusCode: 200, message: 'OK' });
              });
          });
      })
      .catch(err => {
        console.error(err);
        throw new Error(`Unable to update data from ATDW for product ${id}`);
      });
  },
};

function filterMultimedia(multimedia) {
  // trim query params from existing urls
  multimedia.forEach(media => {
    const url = URI.parse(media.serverPath);
    media.serverPath = `${url.scheme}://${url.host}${url.path}`;
  });

  // filter out duplicates
  return uniqBy(multimedia, media => media.serverPath);
}
