module.exports = {
  exec({ $id, $mongo: { $dbPub, $startTransaction } }, { categories }) {
    function publish(session) {
      // return $dbPub
      //   .collection('categories')
      //   .drop()
      //   .then(() => {
      const ops = [];
      categories.forEach(category => {
        ops.push({
          updateOne: {
            filter: { _id: category._id || $id() },
            update: { $set: category },
            upsert: true,
          },
        });
      });
      return $dbPub
        .collection('categories')
        .bulkWrite(ops, { ordered: false })
        .then(() => {
          session.endSession();
          return categories;
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
// categories.forEach(category => {
//   ops.push({
//     updateOne: {
//       filter: { _id: category._id || $id() },
//       update: { $set: category },
//       upsert: true,
//     },
//   });
// });
// return $db
//   .collection('categories')
//   .bulkWrite(ops, { ordered: false })
//   .then(() => {
//     return categories;
//   })
//   .catch(err => {
//     throw err;
//   });
