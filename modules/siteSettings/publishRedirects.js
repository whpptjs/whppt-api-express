module.exports = {
  exec({ $id, $mongo: { $dbPub, $db, $startTransaction } }, { redirects }) {
    function publish(session) {
      // return $dbPub
      //   .collection('redirects')
      //   .drop()
      //   .then(() => {
      const ops = [];
      redirects.forEach(redirect => {
        ops.push({
          updateOne: {
            filter: { _id: redirect._id || $id() },
            update: { $set: redirect },
            upsert: true,
          },
        });
      });
      return $dbPub
        .collection('redirects')
        .bulkWrite(ops, { ordered: false })
        .then(() => {
          session.endSession();
          return redirects;
        })
        .catch(err => {
          throw err;
        });
      // });
    }

    return $startTransaction(publish);
  },
};

// const ops = [];
// redirects.forEach(redirect => {
//   ops.push({
//     updateOne: {
//       filter: { _id: redirect._id || $id() },
//       update: { $set: redirect },
//       upsert: true,
//     },
//   });
// });
// return $db
//   .collection('redirects')
//   .bulkWrite(ops, { ordered: false })
//   .then(() => {
//     return redirects;
//   })
//   .catch(err => {
//     throw err;
//   });
