module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('categories')
      .find()
      .toArray()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
