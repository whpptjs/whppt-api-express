// const assert = require('assert');
// const COLLECTIONS = require('../COLLECTIONS');
// const _draft = !!(process.env.DRAFT || true);

// const collectionForType = {
//   page: COLLECTIONS.PAGES,
//   event: COLLECTIONS.EVENTS,
//   collection: COLLECTIONS.COLLECTIONS,
//   research: COLLECTIONS.RESEARCH,
//   researcher: COLLECTIONS.RESEARCHER,
// };

module.exports = {};
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
