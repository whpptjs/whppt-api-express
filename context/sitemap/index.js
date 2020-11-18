const sitemapQuery = require('./fetchPages');
const applySecurityRoles = require('./applySecurityRoles');

module.exports = context => {
  return function(args = {}) {
    return sitemapQuery(context, args).then(({ sitemap, total }) => {
      return applySecurityRoles(context, sitemap).then(_sitemap => {
        return { sitemap: _sitemap, total };
      });
    });
  };
};
