module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { limit = 9, currentPage = 1 } = query;

    return $db
      .collection('images')
      .aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            images: [{ $skip: limit * (currentPage - 1) }, { $limit: limit }],
          },
        },
      ])
      .toArray()
      .then(({ 0: { total, images } }) => ({
        total: total[0] ? total[0].count : 0,
        images,
      }));
  },
};
