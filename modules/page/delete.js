module.exports = {
  exec({ $mongo: { $db } }, { _id }) {
    return $db.collection('pages').deleteOne({ _id });
  },
};
