module.exports = {
  exec({ $id, $mongo: { $dbPub, $db, $startTransaction } }, { redirects }) {
    function publish(session) {
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
    }

    return $startTransaction(publish);
  },
};
