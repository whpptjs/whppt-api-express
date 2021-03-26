const assert = require('assert');
const { map } = require('lodash');

module.exports = {
  exec({ whpptOptions, $mongo: { $startTransaction, $db, $save } }, { nav }) {
    assert(nav, 'Please provide a Nav Object.');

    nav._id = nav._id || 'nav';

    const { extractNavImages, extractNavLinks } = whpptOptions;

    const imageDependencies = extractNavImages ? map(extractNavImages(nav), i => ({ parentId: nav._id, imageId: i, type: 'image' })) : [];
    const linkDependencies = extractNavLinks ? map(extractNavLinks(nav), l => ({ parentId: nav._id, href: l, type: 'link' })) : [];

    const dependencies = [...imageDependencies, ...linkDependencies];

    const DEP_COLLECTION = 'dependencies';

    let _nav = nav;

    return $startTransaction(session => {
      return $db
        .collection(DEP_COLLECTION)
        .deleteMany({ parentId: nav._id }, { session })
        .then(() => {
          if (dependencies.length) {
            return $db
              .collection(DEP_COLLECTION)
              .insertMany(dependencies, { session })
              .then(() => {
                return $save('site', nav, { session }).then(savedNav => (_nav = savedNav));
              });
          }

          return $save('site', nav, { session });
        });
    }).then(() => _nav);
  },
};
