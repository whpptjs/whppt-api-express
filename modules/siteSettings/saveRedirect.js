module.exports = {
  exec({ $id, $mongo: { $save } }, { redirect }) {
    redirect._id = redirect._id || $id();
    return $save('redirects', redirect).then(() => {
      return redirect;
    });
    // return $db
    //   .collection('redirects')
    //   .updateOne({ _id: redirect._id }, { $set: redirect }, { upsert: true })
    //   .then(() => {
    //     return redirect;
    //   });
  },
};
