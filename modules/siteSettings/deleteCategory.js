module.exports = {
  exec({ $mongo: { $db } }, { id }) {
    return $db.collection('categories').remove({ id });
  },
};
