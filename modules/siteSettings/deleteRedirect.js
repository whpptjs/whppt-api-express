module.exports = {
  exec({ $mongo: { $db } }, { _id }) {
    return $db.collection('redirects').deleteOne({ _id });
  },
};
