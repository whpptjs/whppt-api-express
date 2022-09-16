module.exports = {
  exec({ $id, $mongo: { $db } }, { redirects }) {
    const ops = [];

    redirects.forEach(redirect => {
      ops.push({
        updateOne: {
          filter: { _id: redirect._id || $id.newId() },
          update: { $set: redirect },
          upsert: true,
        },
      });
    });

    return $db
      .collection('redirects')
      .bulkWrite(ops, { ordered: false })
      .then(() => {
        return redirects;
      })
      .catch(err => {
        throw err;
      });
  },
};
