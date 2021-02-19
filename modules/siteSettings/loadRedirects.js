const { take, drop } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, { page, size, domainId, search }) {
    const findParams = { domainId };

    if (search) findParams.$or = [{ to: { $regex: search, $options: 'i' } }, { from: { $regex: search, $options: 'i' } }];

    return $db
      .collection('redirects')
      .find(findParams)
      .toArray()
      .then(redirects => {
        if (!page && !size) return { redirects, total: redirects.length };

        return { redirects: take(drop(redirects, size * (page - 1)), size), total: redirects.length };
      });
  },
};
