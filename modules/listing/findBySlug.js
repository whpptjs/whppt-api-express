module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { slug } = query;

    return $db
      .collection('pages')
      .findOne({ slug })
      .then(page => {
        return $db
          .collection('listings')
          .findOne({ _id: page._id })
          .then(listing => {
            return { listing };
          });
      });
  },
};
