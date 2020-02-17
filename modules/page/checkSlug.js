module.exports = {
  exec({ $mongo: { $db } }, { slug }) {
    return $db
      .collection('pages')
      .findOne({ slug })
      .then(page => {
        return page && page._id;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
