const { uniqBy, get, map, forEach, find, compact } = require('lodash');

module.exports = function imagesExtractor(pageType, page) {
  let images =
    pageType && pageType.extractImages
      ? map(compact(pageType.extractImages(page)), imageId => ({ _id: buildId(imageId, page._id), imageId, parentId: page._id, slug: page.slug, type: 'image' }))
      : [];

  const metaImages = [];

  const ogImageId = get(page, 'og.image.imageId');
  const twitterImageId = get(page, 'twitter.image.imageId');

  if (ogImageId) metaImages.push({ _id: buildId(ogImageId, page._id), imageId: ogImageId, parentId: page._id, slug: page.slug, type: 'image' });
  if (twitterImageId) metaImages.push({ _id: buildId(twitterImageId, page._id), imageId: twitterImageId, parentId: page._id, slug: page.slug, type: 'image' });

  const contentSections = pageType.contentSections || ['contents'];

  forEach(contentSections, contentSection => {
    forEach(page[contentSection], componentData => {
      const componentType = find(pageType.components, c => c.componentType === componentData.componentType);

      const componentImages = compact(componentType && componentType.extractImages ? componentType.extractImages(componentData) : []);
      const _componentImages = map(componentImages, ci => ({ _id: buildId(ci, page._id), imageId: ci, parentId: page._id, slug: page.slug, type: 'image' }));

      images = [...images, ..._componentImages, ...metaImages];
    });
  });

  return uniqBy(images, i => i._id);
};

function buildId(item, parent) {
  return `${item}_${parent}`;
}
