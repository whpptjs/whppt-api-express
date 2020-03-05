module.exports = {
  exec({ $mongo: { $dbPub } }, { redirect }) {
    return $dbPub
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
