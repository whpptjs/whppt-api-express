const assert = require('assert');
const { map } = require('lodash');

module.exports = {
  exec({ $mongo: { $delete, $db } }, { _id }) {
    assert(_id, 'A Page Id must be provided.');

    return $delete('pages', _id).then(() => {
      return $db
        .collection('listings')
        .findOne({ _id })
        .then(listing => {
          if (listing && listing.atdw) {
            return $delete('listings', listing._id).then(() => {
              if (listing.atdw.services && listing.atdw.services.length) {
                return Promise.all(
                  map(listing.atdw.services, s => {
                    return $delete('listings', s.serviceId);
                  })
                );
              }
            });
          }
        });
    });
  },
};
