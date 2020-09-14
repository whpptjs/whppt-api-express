module.exports = {
  exec({ $mongo: { $db } }, { collection }) {
    return $db
      .collection(collection)
      .find()
      .toArray()
      .then(pages => pages);
  },
};
