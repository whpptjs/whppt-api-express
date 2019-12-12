// const assert = require('assert');
// const COLLECTIONS = require('../COLLECTIONS');

// const collectionForType = {
//   page: COLLECTIONS.PAGES,
//   event: COLLECTIONS.EVENTS,
//   collection: COLLECTIONS.COLLECTIONS,
//   research: COLLECTIONS.RESEARCH,
//   researcher: COLLECTIONS.RESEARCHER,
//   home: COLLECTIONS.HOME,
// };

// const slugPrefixes = {
//   event: 'event',
//   collection: 'collection',
//   research: 'research-item',
//   researcher: 'researcher',
// };

module.exports = {};
// module.exports = {
//   exec({ $id, $mongo, $image }, { type, page, image }) {
//     const collection = collectionForType[type];
//     assert(collection, 'Invalid aggregate type.');

//     page._id = page._id || $id();
//     // page.slug = page.slug || slugPrefixes[type] ? `${slugPrefixes[type]}/${page._id}` : page._id;
//     page.lastModified = new Date();
//     page.draft = true;
//     if (!page.slug) page.slug = slugPrefixes[type] ? `${slugPrefixes[type]}/${page._id}` : page._id;

//     return $mongo.then(({ saveDoc, db, startTransaction }) => {
//       return startTransaction(session => {
//         return Promise.all([
//           image && $image.updateImageUsage(type, page, image, { db, saveDoc, session }),
//           saveDoc(collection, page, { session }),
//         ]);
//       }).then(() => page);
//     });
//   },
// };
