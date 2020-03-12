module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('redirects')
      .find()
      .toArray()
      .then(result => {
        return result;
      })
      .catch(err => {
        throw err;
      });
  },
};
