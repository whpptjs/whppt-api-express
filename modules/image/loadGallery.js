module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { limit, currentPage } = query;
    const numLimit = Number(limit);
    const numCurrentPage = Number(currentPage);

    return $db
      .collection('images')
      .aggregate([
        { $sort: { uploadedOn: -1 } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            images: [{ $skip: numLimit * (numCurrentPage - 1) }, { $limit: numLimit }],
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
