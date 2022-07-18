module.exports = {
  exec({ $mongo: { $publish } }, { domain }) {
    return $publish('domains', domain);
  },
};
