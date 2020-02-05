module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { id } = query;

    return $db
      .collection('listings')
      .findOne({ _id: id })
      .then(listing => {
        return { listing };
      });
  },
};
