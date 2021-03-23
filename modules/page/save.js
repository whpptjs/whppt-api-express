const assert = require('assert');
const { forEach, find, compact, map } = require('lodash');

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

    // TODO: work out how to return correct page object rather than mongo res from $startTransaction
    return $startTransaction(session => {
      return $db
        .collection('dependencies')
        .deleteMany({ parentId: page._id }, { session })
        .then(() => {
          const dependencies = compact([...usedImages, ...usedLinks]);
          console.log('✨ ~ file: save.js ~ line 26 ~ .then ~ dependencies', dependencies);

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

function imagesExtractor(pageType, page) {
  let images = pageType.extractImages ? map(compact(pageType.extractImages(page)), imageId => ({ imageId, parentId: page._id, type: 'image`' })) : [];

  console.log('✨ ~ file: save.js ~ line 43 ~ imagesExtractor ~ images', images);

  const contentSections = pageType.contentSections || ['contents'];

  forEach(contentSections, contentSection => {
    forEach(page[contentSection], componentData => {
      const componentType = find(pageType.components, c => c.componentType === componentData.componentType);

      const componentImages = compact(componentType.extractImages ? componentType.extractImages(componentData) : []);
      const _componentImages = map(componentImages, ci => ({ imageId: ci, parentId: page._id, type: 'image' }));

      images = [...images, ..._componentImages];
    });
  });

  return images;
}

function linksExtractor(pageType, page) {
  let links = pageType.extractLinks ? pageType.extractLinks(page) : [];

  const contentSections = pageType.contentSections || ['contents'];

  forEach(contentSections, contentSection => {
    forEach(page[contentSection], componentData => {
      const componentType = find(pageType.components, c => c.componentType === componentData.componentType);

      const componentLinks = compact(componentType.extractLinks ? componentType.extractLinks(componentData) : []);
      const _componentLinks = map(componentLinks, cl => ({ parentId: page._id, ...cl, type: 'link' }));

      links = [...links, ..._componentLinks];
    });
  });

  return links;
}
