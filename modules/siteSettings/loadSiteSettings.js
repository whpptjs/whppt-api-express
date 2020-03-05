module.exports = {
  exec({ $mongo: { $fetch } }) {
    return $fetch('site', 'siteSettings')
      .then(res => {
        console.log('exec -> res', res);
        return res;
      })
      .catch(err => {
        console.error(err);
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
//         console.log('exec -> result', result);
//         return result;
//       })
//       .catch(err => {
//         console.error(err);
//         throw err;
//       });
//   },
// };
