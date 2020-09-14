module.exports = {
  exec({ $mongo: { $db } }, { slug, _id, title }) {
    return $db.collection('pages').updateOne(
      { _id },
      {
        $set: {
          slug,
          'header.title': title,
        },
      }
    );
  },
};
