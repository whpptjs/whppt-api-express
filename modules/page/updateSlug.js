module.exports = {
  exec({ $mongo: { $db } }, { slug, _id }) {
    return $db
      .collection('pages')
      .updateOne(
        { _id },
        {
          $set: {
            slug,
          },
        }
      )
      .then(listing => {
        return { listing };
      });
  },
};
