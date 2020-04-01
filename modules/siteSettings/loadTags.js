module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('site')
      .findOne({ _id: 'tags' })
      .then(result => {
        return result || {};
      })
      .catch(err => {
        throw err;
      });
  },
};
