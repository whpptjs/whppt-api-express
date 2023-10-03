module.exports = {
  exec({ $mongo: { $db } }, { slug, _id, collection, domainId }) {
    return $db
      .collection(collection)
      .findOne({ slug: slug && slug.toLowerCase(), _id: { $ne: _id }, domainId })
      .then(page => page && page._id);
  },
};
