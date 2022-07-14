const { get } = require('lodash');

module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, [], true);
  },
  exec({ $mongo: { $startTransaction, $db, $save, $record } }, { siteSettings, user }) {
    const dependencies = [];

    const ogImageId = get(siteSettings, 'og.image.imageId');
    const twitterImageId = get(siteSettings, 'twitter.image.imageId');

    if (ogImageId) dependencies.push({ imageId: ogImageId, parentId: siteSettings._id, type: 'image' });
    if (twitterImageId) dependencies.push({ imageId: twitterImageId, parentId: siteSettings._id, type: 'image' });

    let savedSiteSettings;

    return $startTransaction(async session => {
      const DEP_COLLECTION = 'dependencies';

      await $db.collection(DEP_COLLECTION).deleteMany({ parentId: siteSettings._id });
      if (dependencies.length) {
        await $db.collection(DEP_COLLECTION).insertMany(dependencies);
      }
      savedSiteSettings = await $save('site', siteSettings, { session });
      await $record('site', 'save', { data: siteSettings, user }, { session });
    }).then(() => savedSiteSettings);
  },
};
