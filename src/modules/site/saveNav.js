const assert = require('assert');
const { map, compact } = require('lodash');

module.exports = {
  async exec(
    { $id, whpptOptions, $mongo: { $startTransaction, $db, $save, $record } },
    { nav, user }
  ) {
    assert(nav, 'Please provide a Nav Object.');
    assert(nav.domainId, 'domainId is required');

    nav._id = nav._id || `nav_${nav.domainId}`;

    // TODO: Include the extract links and images. Asana task logged
    // const { extractNavImages, extractNavLinks } = whpptOptions;

    // const imageDependencies = extractNavImages
    //   ? map(compact(extractNavImages(nav)), i => ({
    //       _id: $id.newId(),
    //       parentId: nav._id,
    //       imageId: i,
    //       type: 'image',
    //     }))
    //   : [];
    // const linkDependencies = extractNavLinks
    //   ? map(compact(extractNavLinks(nav)), l => ({
    //       _id: $id.newId(),
    //       parentId: nav._id,
    //       href: l,
    //       type: 'link',
    //     }))
    //   : [];

    // const dependencies = [...imageDependencies, ...linkDependencies];
    const dependencies = [];

    const DEP_COLLECTION = 'dependencies';

    let _nav = nav;

    return $startTransaction(async session => {
      await $db.collection(DEP_COLLECTION).deleteMany({ parentId: nav._id }, { session });
      if (dependencies.length) {
        await $db.collection(DEP_COLLECTION).insertMany(dependencies, { session });
      }
      _nav = await $save('site', nav, { session });
      await $record('site', 'save', { data: nav, user }, { session });
    }).then(() => _nav);
  },
};
