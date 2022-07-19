const assert = require('assert');
const { map, compact } = require('lodash');

module.exports = {
  async exec({ $id, whpptOptions, $mongo: { $startTransaction, $db, $save, $record } }, { footer, user }) {
    assert(footer, 'Please provide a footer object.');
    assert(footer.domainId, 'Footer requires a domain id (domainId)');

    footer._id = footer._id || `footer_${footer.domainId}`;

    const { extractFooterImages, extractFooterLinks } = whpptOptions;

    const imageDependencies = extractFooterImages ? map(compact(extractFooterImages(footer)), i => ({ _id: $id(), parentId: footer._id, imageId: i, type: 'image' })) : [];
    const linkDependencies = extractFooterLinks ? map(compact(extractFooterLinks(footer)), l => ({ _id: $id(), parentId: footer._id, href: l, type: 'link' })) : [];

    const dependencies = [...imageDependencies, ...linkDependencies];

    const DEP_COLLECTION = 'dependencies';

    let _footer = footer;

    return $startTransaction(async session => {
      await $db.collection(DEP_COLLECTION).deleteMany({ parentId: footer._id }, { session });
      if (dependencies.length) {
        await $db.collection(DEP_COLLECTION).insertMany(dependencies, { session });
      }
      _footer = await $save('site', footer, { session });
      await $record('site', 'save', { data: footer, user }, { session });
    }).then(() => _footer);
  },
};
