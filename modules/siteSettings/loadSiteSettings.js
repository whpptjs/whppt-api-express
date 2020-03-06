module.exports = {
  exec({ $mongo: { $fetch } }) {
    return $fetch('site', 'siteSettings')
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
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
