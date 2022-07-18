const { get } = require('lodash');

module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, [], true);
  },
  exec({ $mongo: { $startTransaction, $db, $save } }, { siteSettings }) {
    const dependencies = [];

    const ogImageId = get(siteSettings, 'og.image.imageId');
    const twitterImageId = get(siteSettings, 'twitter.image.imageId');

    if (ogImageId) dependencies.push({ imageId: ogImageId, parentId: siteSettings._id, type: 'image' });
    if (twitterImageId) dependencies.push({ imageId: twitterImageId, parentId: siteSettings._id, type: 'image' });

    return $startTransaction(session => {
      const DEP_COLLECTION = 'dependencies';

      return $db
        .collection(DEP_COLLECTION)
        .deleteMany({ parentId: siteSettings._id })
        .then(() => {
          if (dependencies.length) {
            return $db
              .collection(DEP_COLLECTION)
              .insertMany(dependencies)
              .then(() => $save('site', siteSettings, { session }));
          } else {
            return $save('site', siteSettings, { session });
          }
        });
    });
  },
};
