module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('site')
      .findOne({ _id: 'siteSettings' })
      .then(result => {
        return result;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
