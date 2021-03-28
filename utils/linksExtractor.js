const { map, forEach, find, compact } = require('lodash');

module.exports = function linksExtractor(pageType, page) {
  let links = pageType.extractLinks ? map(pageType.extractLinks(page), link => ({ parentId: page._id, href: link, type: 'link' })) : [];

  const contentSections = pageType.contentSections || ['contents'];

  forEach(contentSections, contentSection => {
    forEach(page[contentSection], componentData => {
      const componentType = find(pageType.components, c => c.componentType === componentData.componentType);

      const componentLinks = compact(componentType.extractLinks ? componentType.extractLinks(componentData) : []);
      const _componentLinks = map(componentLinks, cl => ({ parentId: page._id, href: cl, type: 'link' }));

      links = [...links, ..._componentLinks];
    });
  });

  return links;
};
