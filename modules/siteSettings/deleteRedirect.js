module.exports = {
  exec({ $mongo: { $delete } }, { _id }) {
    return $delete('redirects', _id);
  },
};
