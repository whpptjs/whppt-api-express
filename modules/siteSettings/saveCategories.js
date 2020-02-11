module.exports = {
  exec({ $mongo: { $db } }, { categories }) {
    return $db
      .collection('siteSettings')
      .updateOne({id: 'categories'}, {$set: {categories}}, {upsert: true})
      .then(() => {
        return categories
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};