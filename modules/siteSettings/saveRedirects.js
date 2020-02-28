module.exports = {
  exec({ $id, $mongo: { $db } }, { redirects }) {
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
    return $db
      .collection('redirects')
      .bulkWrite(ops, { ordered: false })
      .then(() => {
        return redirects;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
