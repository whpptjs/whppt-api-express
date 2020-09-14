module.exports = {
  exec({ $mongo: { $db } }, { slug, _id, collection }) {
    return $db
      .collection(collection)
      .findOne({ slug, _id: { $ne: _id } })
      .then(page => page && page._id);
  },
};
