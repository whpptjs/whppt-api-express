module.exports = {
  exec({ $mongo: { $db } }, { slug, _id }) {
    return $db
      .collection('pages')
      .findOne({ slug, _id: { $ne: _id } })
      .then(page => {
        return page && page._id;
      })
      .catch(err => {
        throw err;
      });
  },
};
