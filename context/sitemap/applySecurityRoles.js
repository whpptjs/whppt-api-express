const { intersection, map } = require('lodash');

module.exports = ({ $mongo: { $db } }, { user, sitemap }) => {
  if (!user) {
    return Promise.resolve(
      map(sitemap, page => ({
        ...page,
        publishableByYou: false,
      }))
    );
  }

  return $db
    .collection('roles')
    .find({ _id: { $in: user.roles }, admin: true })
    .toArray()
    .then(userAdminRoles => {
      return map(sitemap, page => {
        const { publisherRoles = [] } = page;

        const matchingPublisherRoles = intersection(publisherRoles, user.roles);
        const publishableByYou = Boolean((matchingPublisherRoles.length === publisherRoles.length && publisherRoles.length > 0) || userAdminRoles.length > 0);

        return { ...page, publishableByYou };
      });
    });
};
