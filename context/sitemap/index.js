const applySecurityRoles = require('./applySecurityRoles');
const sitemapQuery = require('./fetchPages');

module.exports = context => {
  return function (args = {}) {
    return sitemapQuery(context, args).then(({ sitemap, total }) => {
      if (process.env.DRAFT && process.env.DRAFT === 'true') {
        return applySecurityRoles(context, { user: args.user, sitemap }).then(_sitemap => {
          return { sitemap: _sitemap, total };
        });
      }

      return { sitemap, total };
    });
  };
};
