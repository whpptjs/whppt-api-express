module.exports = {
  exec({ $mongo: { $db } }, { domain }) {
    return $db.collection('domains').updateOne({ _id: domain._id }, { $set: domain });
  },
};
