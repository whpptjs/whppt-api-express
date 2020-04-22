module.exports = {
  exec({ $mongo: { $fetch } }) {
    return $fetch('site', 'emailerConfig')
      .then(res => {
        if (res && res.config && res.config.auth && res.config.auth.pass) res.config.auth.pass = res.config.auth.pass = 'hiddenpassword';
        return res;
      })
      .catch(err => {
        throw err;
      });
  },
};
