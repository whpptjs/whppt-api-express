module.exports = {
  exec({ $mongo: { $unpublish } }, { domain }) {
    return $unpublish('domains', domain._id);
  },
};
