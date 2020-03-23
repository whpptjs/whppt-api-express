const assert = require('assert');
const { map } = require('lodash');
const { unPublishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $mongo: { $unpublish, $db } }, { _id }) {
    assert(_id, 'A Page Id must be provided.');
    return $db
      .collection('pages')
      .updateOne({ _id }, { $set: { published: false } })
      .then(() => {
        return $unpublish('pages', _id).then(() => {
          return $db
            .collection('listings')
            .findOne({ _id })
            .then(listing => {
              if (listing && listing.atdw) {
                return $unpublish('listings', _id).then(() => {
                  if (listing.atdw.services && listing.atdw.services.length) {
                    return Promise.all(
                      map(listing.atdw.services, s => {
                        console.log('exec -> s.serviceId', s.serviceId);
                        return $unpublish('listings', s.serviceId);
                      })
                    );
                  }
                });
              }
              if (!unPublishCallBack) return;
              return unPublishCallBack(_id);
            });
        });
      });
  },
};
