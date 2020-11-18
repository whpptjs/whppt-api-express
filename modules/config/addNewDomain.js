module.exports = {
  exec({ $mongo: { $db }, $id }, { domain }) {
    domain._id = $id();
    return $db
      .collection('domains')
      .updateOne({ _id: domain._id }, { $set: domain }, { upsert: true })
      .then(() => {
        return domain;
      })
      .catch(err => {
        throw err;
      });
  },
};
