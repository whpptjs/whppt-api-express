const assert = require('assert');
const { map, get, forEach, find, uniqBy } = require('lodash');
const URI = require('uri-js');

// Whppt Config
const { atdw } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $atdw, $mongo: { $db } }, query) {
    const stringFromPath = function(product, path) {
      return get(product, path);
    };

    const atdwFields = {
      name: stringFromPath,
      description: stringFromPath,
      activeStatus: stringFromPath,
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

        // should uniq this...
        return tags;
      },
    };

    const { id } = query;
    assert(id, 'Please provide a Listing ID');

    const { apiUrl, apiKey } = atdw;

    assert(apiUrl, 'Please provide an ATDW URL.');
    assert(apiKey, 'Please provide an ATDW API Key.');

    return Promise.all([$atdw.$get(`https://${apiUrl}/api/atlas/product?key=${apiKey}&out=json&productId=${id}`), $db.collection('listings').findOne({ _id: id })]).then(
      ([listingData, listing]) => {
        const { multimedia } = listingData;
        listingData.multimedia = filterMultimedia(multimedia);

        forEach(atdwFields, (getFieldValue, fieldKey) => {
          const property = listing[fieldKey];

          if (!property || property.provider !== 'atdw') return;
          property.value = getFieldValue(listingData, property.path);
        });

        listing.atdw = { ...listing.atdw, ...listingData };
        listing.hasFullATDWData = true;

        return $db
          .collection('listings')
          .updateOne({ _id: id }, { $set: listing })
          .then(() => {
            return Promise.resolve({ statusCode: 200, message: 'OK' });
          });
      }
    );
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
