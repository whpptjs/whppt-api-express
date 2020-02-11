module.exports = {
  exec({ $mongo: { $db } }, query) {
    const { id } = query;

    return $db.collection('image').findOne({ _id: id });
  },
};
