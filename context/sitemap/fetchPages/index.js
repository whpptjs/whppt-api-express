const { flatten, map, take, drop, filter } = require('lodash');

module.exports = ({ $mongo: { $db }, $pageTypes, $fullUrl }, { page, size, slug, freq }) => {
  const filteredCollections = filter($pageTypes, pt => !pt.collection.excludeFromSitemap);
  const collections = map(filteredCollections, pt => pt.collection.name);

  // built filters out.
  const filters = {};

  if (freq) filters.frequency = freq;
  if (slug) filters.slug = { $regex: slug === '/' ? '' : slug, $options: 'i' };

  return Promise.all(
    map(collections, collection => {
      return $db
        .collection(collection)
        .find(filters, {
          slug: true,
          updatedAt: true,
          createdAt: true,
          published: true,
          lastPublished: true,
          pageType: true,
          template: true,
          frequency: true,
          priority: true,
        })
        .toArray()
        .then(pages => {
          return map(pages, _page => ({ ..._page, url: $fullUrl(_page.slug) }));
        });
    })
  ).then(sitemaps => {
    const fullSitemap = flatten(sitemaps);

    if (!page && !size) return { sitemap: fullSitemap, total: fullSitemap.length };

    return { sitemap: take(drop(fullSitemap, size * (page - 1)), size), total: fullSitemap.length };
  });
};
