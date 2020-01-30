module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('pages')
      .find()
      .toArray()
      .then(pages => pages);
  },
};
