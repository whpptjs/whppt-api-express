module.exports = {
  exec({ $mongo: { $delete } }, { _id }) {
    return $delete('listings', _id);
  },
};
