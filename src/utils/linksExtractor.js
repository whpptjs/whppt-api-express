const { map, forEach, find, compact } = require('lodash');
const $id = require('uniqid');

module.exports = function linksExtractor(pageType, page) {
  let links = pageType.extractLinks
    ? map(pageType.extractLinks(page), link => ({
        _id: $id(),
        parentId: page._id,
        slug: page.slug,
        href: link,
        type: 'link',
      }))
    : [];

  const contentSections = pageType.contentSections || ['contents'];

  forEach(contentSections, contentSection => {
    forEach(page[contentSection], componentData => {
      const componentType = find(
        pageType.components,
        c => c.componentType === componentData.componentType
      );

      const componentLinks = compact(
        componentType && componentType.extractLinks
          ? componentType.extractLinks(componentData)
          : []
      );
      const _componentLinks = map(componentLinks, cl => ({
        _id: $id.newId(),
        parentId: page._id,
        slug: page.slug,
        href: cl,
        type: 'link',
      }));

      links = [...links, ..._componentLinks];
    });
  });

  return links;
};
