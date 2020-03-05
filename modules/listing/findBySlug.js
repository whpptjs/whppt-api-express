module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { slug } = query;

    return $db
      .collection('listings')
      .findOne({ slug })
      .then(listing => {
        return { listing };
      });
  },
};
