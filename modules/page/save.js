const assert = require('assert');
const { uniqBy, find } = require('lodash');
const linksExtractor = require('../../utils/linksExtractor');
const imagesExtractor = require('../../utils/imagesExtractor');

module.exports = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.editorRoles]);
  },
  exec({ whpptOptions, $id, $mongo: { $startTransaction, $db, $save } }, { page, collection }) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection.');

    page._id = page._id || $id();

    const pageType = find(whpptOptions.pageTypes, pt => pt.name === page.pageType);

    const usedImages = imagesExtractor(pageType, page);
    const usedLinks = linksExtractor(pageType, page);

    let _page = page;

    return $startTransaction(session => {
      return $db
        .collection('dependencies')
        .deleteMany({ parentId: page._id }, { session })
        .then(() => {
          const dependencies = uniqBy([...usedImages, ...usedLinks], image => image._id);

          if (dependencies && dependencies.length) {
            return $db
              .collection('dependencies')
              .insertMany(dependencies, { session })
              .then(() => $save(collection, page, { session }));
          } else {
            return $save(collection, page, { session });
          }
        });
    });
  },
};
