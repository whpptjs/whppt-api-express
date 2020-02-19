module.exports = {
  exec({ $mongo: { $db }, $image }, { id }) {
    //Not really removing image for now
    return Promise.resolve();
    // return $image.remove(imageId)
  },
};
