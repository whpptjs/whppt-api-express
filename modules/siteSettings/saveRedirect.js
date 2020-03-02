module.exports = {
  exec({ $id, $mongo: { $db } }, { redirect }) {
    redirect._id = redirect._id || $id();
    return $db
      .collection('redirects')
      .updateOne({ _id: redirect._id }, { $set: redirect }, { upsert: true })
      .then(() => {
        return redirect;
      });
  },
};
