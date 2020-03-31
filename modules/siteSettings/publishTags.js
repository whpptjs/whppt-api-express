module.exports = {
  exec({ $mongo: { $publish } }, { tags }) {
    tags._id = tags._id || 'tags'
    return $publish('site', tags).then(() => {
      return tags;
    });
  },
};
