module.exports = {
  exec({ $mongo: { $fetch } }) {
    return $fetch('site', 'emailerConfig')
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  },
};
