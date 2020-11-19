module.exports = {
  exec({ $mongo: { $db } }, { slug, _id, collection, domainId }) {
    return $db
      .collection(collection)
      .findOne({ slug, _id: { $ne: _id }, domainId })
      .then(page => page && page._id);
  },
};
