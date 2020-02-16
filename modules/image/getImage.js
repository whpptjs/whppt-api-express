module.exports = {
  exec({ $mongo: { $db }, $image }, { imageId }) {
    const { id } = query;

    return $image.fetchOriginal({ id: imageId });
  },
};
