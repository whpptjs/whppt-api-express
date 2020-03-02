module.exports = {
  exec({ $mongo: { $db } }, { redirect }) {
    return $db
      .collection('redirects')
      .findOne({ to: redirect.to, from: redirect.from })
      .then(result => {
        if (result) return true;
        return false;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
