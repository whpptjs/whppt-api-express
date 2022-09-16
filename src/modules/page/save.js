const assert = require('assert');
const { uniqBy, find } = require('lodash');
const imagesExtractor = require('../../utils/imagesExtractor');
const linksExtractor = require('../../utils/linksExtractor');

module.exports = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.editorRoles]);
  },
  exec(
    { $pageTypes, $id, $mongo: { $startTransaction, $db, $save, $record } },
    { page, collection, user }
  ) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection.');

    page._id = page._id || $id.newId();

    const pageType = find($pageTypes, pt => pt.name === page.pageType);

    const usedImages = imagesExtractor(pageType, page);
    const usedLinks = linksExtractor(pageType, page);

    return $startTransaction(async session => {
      await $db
        .collection('dependencies')
        .deleteMany({ parentId: page._id }, { session });
      const dependencies = uniqBy([...usedImages, ...usedLinks], image => image._id);

      if (dependencies && dependencies.length) {
        await $db.collection('dependencies').insertMany(dependencies, { session });
      }
      const savedPage = await $save(collection, page, { session });
      page.updatedAt = savedPage.updatedAt;
      await $record(collection, 'save', { data: page, user }, { session });
      return page;
    }).then(() => page);
  },
};
