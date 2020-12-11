const { get } = require('lodash');
const assert = require('assert');
const config = require(process.cwd() + '/whppt.config.js');

module.exports = {
  exec({ $mongo: { $db } }, { domainId }) {
    if (!domainId || domainId === 'undefined') return Promise.reject({ status: 500, message: 'Error: no domain found' });
    const query = { _id: `footer_${domainId}`, domainId };

    return $db
      .collection('site')
      .findOne(query)
      .then(footer => {
        if (!footer) {
          const defaultFooter = get(config, 'defaults.footer');
          return { ...defaultFooter, _id: `footer_${domainId}`, domainId };
        }
        return footer;
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
