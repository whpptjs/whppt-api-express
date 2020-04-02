module.exports = {
  exec({ $id, $mongo: { $save } }, { tags }) {
    tags._id = tags._id || 'tags'
    return $save('site', tags).then(() => {
      return tags;
    });
  },
};
