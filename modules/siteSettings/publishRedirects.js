module.exports = {
  exec({ $id, $mongo: { $dbPub, $db, $startTransaction } }, { redirects }) {
    function publish(session) {
      console.log('test -> session', session);
      // return $dbPub
      //   .collection('redirects')
      //   .drop()
      //   .then(() => {
      const ops = [];
      console.log('publish -> ops', ops);
      redirects.forEach(redirect => {
        ops.push({
          updateOne: {
            filter: { _id: redirect._id || $id() },
            update: { $set: redirect },
            upsert: true,
          },
        });
      });
      console.log('publish -> ops', ops);
      return $dbPub
        .collection('redirects')
        .bulkWrite(ops, { ordered: false })
        .then(() => {
          session.endSession();
          return redirects;
        })
        .catch(err => {
          console.error(err);
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
//     console.error(err);
//     throw err;
//   });
