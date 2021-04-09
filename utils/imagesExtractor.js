const { get, map, forEach, find, compact } = require('lodash');
const $id = require('uniqid');

module.exports = function imagesExtractor(pageType, page) {
  let images = pageType && pageType.extractImages ? map(compact(pageType.extractImages(page)), imageId => ({ _id: $id(), imageId, parentId: page._id, type: 'image`' })) : [];

  const metaImages = [];

  const ogImageId = get(page, 'og.image.imageId');
  const twitterImageId = get(page, 'twitter.image.imageId');

  if (ogImageId) metaImages.push({ imageId: ogImageId, parentId: page._id, type: 'image' });
  if (twitterImageId) metaImages.push({ _id: $id(), imageId: twitterImageId, parentId: page._id, type: 'image' });

  const contentSections = pageType.contentSections || ['contents'];

  forEach(contentSections, contentSection => {
    forEach(page[contentSection], componentData => {
      const componentType = find(pageType.components, c => c.componentType === componentData.componentType);

      const componentImages = compact(componentType && componentType.extractImages ? componentType.extractImages(componentData) : []);
      const _componentImages = map(componentImages, ci => ({ _id: $id(), imageId: ci, parentId: page._id, type: 'image' }));

      images = [...images, ..._componentImages, ...metaImages];
    });
  });

  return images;
};
