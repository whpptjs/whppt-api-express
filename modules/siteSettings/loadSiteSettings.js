module.exports = {
  exec({ $mongo: { $fetch, $db } }, { domainId }) {
    const query = { _id: domainId && domainId !== 'undefined' ? `siteSettings_${domainId}` : 'siteSettings' };

    return $db
      .collection('site')
      .findOne(query)
      .then(siteSettings => {
        if (!siteSettings) {
          return { ...siteSettings, _id: domainId && domainId !== 'undefined' ? `siteSettings_${domainId}` : 'siteSettings' };
        }
        return siteSettings;
      })
      .catch(err => {
        throw err;
      });
    // return $fetch('site', 'siteSettings')
    //   .then(res => {
    //     return res;
    //   })
    //   .catch(err => {
    //     throw err;
    //   });
  },
};

// module.exports = {
//   exec({ $mongo: { $db } }) {
//     return $db
//       .collection('site')
//       .findOne({ _id: 'siteSettings' })
//       .then(result => {
//         return result;
//       })
//       .catch(err => {
//         throw err;
//       });
//   },
// };
