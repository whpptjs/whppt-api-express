const assert = require('assert');

module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('site')
      .findOne({ _id: 'footer' })
      .then(footer => {
        if (!footer) return { _id: 'footer' };
        return footer;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
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
