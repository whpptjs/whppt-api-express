const { take, drop } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, { page, size, domainId }) {
    return $db
      .collection('redirects')
      .find({ domainId })
      .toArray()
      .then(redirects => {
        if (!page && !size) return { redirects, total: redirects.length };

        return { redirects: take(drop(redirects, size * (page - 1)), size), total: redirects.length };
      });
  },
};
