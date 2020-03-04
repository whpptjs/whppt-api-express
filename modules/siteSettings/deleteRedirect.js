module.exports = {
  exec({ $mongo: { $delete } }, { _id }) {
    return $delete('redirects', _id);
    // return $db.collection('redirects').deleteOne({ _id });
  },
};
