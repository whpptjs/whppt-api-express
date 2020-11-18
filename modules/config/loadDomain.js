const { find } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, { hostname, domainId }) {
    return $db
      .collection('domains')
      .find()
      .toArray()
      .then(domains => {
        const domain = domainId && domainId !== 'undefined' ? find(domains, d => d._id === domainId) : find(domains, d => find(d.hostnames, h => h === hostname));
        return { domains, domain };
      })
      .catch(err => {
        throw err;
      });
  },
};
