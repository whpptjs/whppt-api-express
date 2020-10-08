const { map } = require('lodash');

module.exports = (_, sitemap) => {
  return Promise.resolve().then(() => map(sitemap, page => ({ ...page, canAccess: true })));
};
