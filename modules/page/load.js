const assert = require('assert');
const { collections } = require(process.cwd() + '/whppt.config.js');

module.exports = {
  exec({ $mongo: { $db } }, { collection, slug }) {
    const _collection = collections[collection];
    assert(_collection, `Collection ${collection} does not exist.`);

    return $db
      .collection(_collection)
      .find({ slug })
      .toArray()
      .then(page => page);
  },
};

// module.exports = {
//   exec({ $mongo }, { type, slug }) {
//     return $mongo.then(({ db }) => {
//       const collection = collectionForType[type];
//       assert(collection, 'Invalid aggregate type.');

//       return (
//         db
//           .collection(collection)
//           // .findOne({ slug, draft: _draft })
//           .findOne({ slug })
//           .then(page => {
//             if (!page) throw new Error('404');
//             page.header = page.header || {};
//             page.content = page.content || [];
//             page.footer = page.footer || {};
//             return { page };
//           })
//       );
//     });
//   },
// };
