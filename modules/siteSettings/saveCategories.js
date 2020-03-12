module.exports = {
  exec({ $id, $mongo: { $db } }, { categories }) {
    const ops = [];
    categories.forEach(category => {
      ops.push({
        updateOne: {
          filter: { _id: category._id || $id() },
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
        throw err;
      });
  },
};
