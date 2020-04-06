module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { limit, currentPage, search } = query;
    console.log('exec -> search', search);
    const numLimit = Number(limit);
    const numCurrentPage = Number(currentPage);

    const files = [{ $limit: numLimit || 1000 }];
    if (numLimit) {
      files.push({ $skip: numLimit * (numCurrentPage - 1) });
    }

    return $db
      .collection('files')
      .aggregate([
        // { $regexMatch: { input: '$description', regex: `/${search}/i` } },
        { $sort: { uploadedOn: -1 } },
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
