module.exports = {
  exec({ $mongo }) {
    return $mongo.then(({ $db }) => {
      return $db
        .collection('pages')
        .find()
        .toArray()
        .then(pages => pages);
    });
  },
};
