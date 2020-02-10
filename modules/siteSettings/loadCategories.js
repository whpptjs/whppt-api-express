module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('siteSettings')
      .findOne({id: 'categories'},)
      .then(result => {
        return result.categories
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};