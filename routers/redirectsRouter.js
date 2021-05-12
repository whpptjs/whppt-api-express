const router = require('express').Router();
const _ = require('lodash');

function setRedirects({ $mongo: { $db } }) {
  return function (req, res, next) {
    const _url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const from = _.chain(_url.pathname).toLower().trimEnd('/').value();

    if (from.startsWith('/api')) return next();
    if (from.startsWith('/_loading')) return next();

    return $db
      .collection('domains')
      .findOne({ hostnames: req.hostname })
      .then(domain => {
        const query = { from: _.trim(from, '/') };

        if (domain && domain._id) {
          query.domainId = domain._id;
        } else {
          query.$or = [{ domainId: { $exists: false } }, { domainId: { $eq: '' } }];
        }

        return $db
          .collection('redirects')
          .findOne(query)
          .then(redirect => {
            if (redirect) {
              return res.redirect(301, redirect.to);
            }

            next();
          });
      });
  };
}

module.exports = context => {
  router.use(setRedirects(context));

  return router;
};
