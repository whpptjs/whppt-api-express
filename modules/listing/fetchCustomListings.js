module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('listings')
      .find({ isCustom: true })
      .toArray()
      .then(result => {
        return result;
      });
  },
};
