module.exports = {
  exec({ $mongo: { $db } }, _query) {
    const { search } = _query;

    const query = {};
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
          },
        },
        {
          description: {
            $regex: search,
          },
        },
      ];
    }
    return $db
      .collection('files')
      .find(query)
      .toArray()
      .then(files => {
        return { files };
      });
  },
};
