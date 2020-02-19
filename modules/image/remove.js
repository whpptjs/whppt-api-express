module.exports = {
  exec({ $mongo: { $db }, $image }, { id }) {
    //Not really removing image for now
    // return $image.remove(imageId)
  },
};
