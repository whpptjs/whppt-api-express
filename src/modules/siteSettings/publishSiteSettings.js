module.exports = {
  exec({ $mongo: { $publish } }, { siteSettings }) {
    return $publish('site', siteSettings);
  },
};
