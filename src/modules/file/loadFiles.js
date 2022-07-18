module.exports = {
  exec({ $mongo: { $db } }, { page, size }) {
    const files = [];

    if (size) files.push({ $skip: Number(size) * (Number(page) - 1) });

    files.push({ $limit: Number(size) || 1000 });

    return $db
      .collection('files')
      .aggregate([
        { $sort: { name: 1 } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            files,
          },
        },
      ])
      .toArray()
      .then(({ 0: { total, files } }) => {
        return { files, total: total[0] ? total[0].count : 0 };
      });
  },
};
