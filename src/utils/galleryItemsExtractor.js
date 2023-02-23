const { uniqBy, get, map, forEach, find, compact } = require('lodash');

module.exports = function galleryItemsExtractor(pageType, page) {
  pageType.extractGalleryItems = pageType.extractGalleryItems || extractGalleryItems;

  const galleryItems =
    pageType && pageType.extractGalleryItems
      ? map(compact(pageType.extractGalleryItems(page)), galleryItemId => ({
          _id: buildId(galleryItemId, page._id),
          galleryItemId,
          parentId: page._id,
          slug: page.slug,
          type: 'image',
        }))
      : [];

  return uniqBy(galleryItems, i => i._id);
};

function buildId(item, parent) {
  return `${item}_${parent}`;
}

const items = [];

function extractGalleryItems(obj) {
  if (typeof obj !== 'object') return;

  if (obj.galleryItemId) {
    items.push(obj.galleryItemId);
  } else {
    Object.entries(obj).forEach(([key]) => {
      extractGalleryItems(obj[key]);
    });
  }

  return items;
}
