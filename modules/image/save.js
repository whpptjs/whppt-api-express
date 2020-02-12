module.exports = {
  exec({ $image, $mongo: { $db }, $id }, { data }) {
    const id = $id();

    return $db
      .collection('images')
      .insertOne({
        id,
        uploadedOn: new Date(),
        name: fileName,
      })
      .then(() => $image.upload(data, id));
  },
};
