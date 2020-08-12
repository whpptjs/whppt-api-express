module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { limit, currentPage, search } = query;
    const numLimit = Number(limit);
    const numCurrentPage = Number(currentPage);

    const files = [];
    if (numLimit) {
      files.push({ $skip: numLimit * (numCurrentPage - 1) });
    }

    files.push({ $limit: numLimit || 1000 });

    return $db
      .collection('files')
      .aggregate([
        // { $regexMatch: { input: '$description', regex: `/${search}/i` } },
        { $sort: { name: 1 } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            files,
          },
        },
      ])
      .toArray()
      .then(({ 0: { total, files } }) => ({
        total: total[0] ? total[0].count : 0,
        files,
      }));
  },
};
