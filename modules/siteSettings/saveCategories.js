module.exports = {
  exec({ $id, $mongo: { $db } }, { categories }) {
    const ops = [];
    categories.forEach(category => {
      ops.push({
        updateOne: {
          filter: { id: category.id || $id() },
          update: { $set: category },
          upsert: true,
        },
      });
    });
    return $db
      .collection('categories')
      .bulkWrite(ops, { ordered: false })
      .then(() => {
        return categories;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
