module.exports = {
  exec({ $mongo: { $db }, $image }, { id }) {
    //Not really removing image for now
    console.log('TCL: exec -> id', id);
    return Promise.resolve();
    // return $image.remove(imageId)
  },
};
