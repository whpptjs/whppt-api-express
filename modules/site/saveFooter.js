const assert = require('assert');
const { map, compact } = require('lodash');

module.exports = {
  exec({ $id, whpptOptions, $mongo: { $startTransaction, $db, $save } }, { footer }) {
    assert(footer, 'Please provide a footer object.');
    assert(footer.domainId, 'Footer requires a domain id (domainId)');

    footer._id = footer._id || `footer_${footer.domainId}`;

    const { extractFooterImages, extractFooterLinks } = whpptOptions;

    const imageDependencies = extractFooterImages ? map(compact(extractFooterImages(footer)), i => ({ _id: $id(), parentId: footer._id, imageId: i, type: 'image' })) : [];
    const linkDependencies = extractFooterLinks ? map(compact(extractFooterLinks(footer)), l => ({ _id: $id(), parentId: footer._id, href: l, type: 'link' })) : [];

    const dependencies = [...imageDependencies, ...linkDependencies];

    const DEP_COLLECTION = 'dependencies';

    let _footer = footer;

    return $startTransaction(session => {
      return $db
        .collection(DEP_COLLECTION)
        .deleteMany({ parentId: footer._id }, { session })
        .then(() => {
          if (dependencies.length) {
            return $db
              .collection(DEP_COLLECTION)
              .insertMany(dependencies, { session })
              .then(() => {
                return $save('site', footer, { session }).then(savedFooter => (_footer = savedFooter));
              });
          }

          return $save('site', footer, { session });
        });
    }).then(() => _footer);
  },
};
