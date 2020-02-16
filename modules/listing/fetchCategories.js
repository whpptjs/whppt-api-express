module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { id } = query;

    return $db
      .collection('listings')
      .aggregate([
        {
          $project: {
            taggedCategories: {
              value: true,
            },
          },
        },
        {
          $unwind: {
            path: '$taggedCategories.value',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: null,
            uniqueValues: { $addToSet: '$taggedCategories.value' },
          },
        },
      ])
      .toArray()
      .then(results => {
        return results[0].uniqueValues;
      });
  },
};
