module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('listings')
      .aggregate([
        {
          $group: {
            _id: null,
            uniqueValues: { $addToSet: '$atdw.productCategoryId' },
          },
        },
      ])
      .toArray()
      .then(results => {
        if (!results || !results.length) return [];
        return results[0].uniqueValues;
      });
  },
};
