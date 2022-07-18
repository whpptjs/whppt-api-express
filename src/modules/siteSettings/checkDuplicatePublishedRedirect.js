module.exports = {
  exec({ $mongo: { $dbPub } }, { redirect }) {
    return $dbPub
      .collection('redirects')
      .findOne({ to: redirect.to, from: redirect.from, domainId: redirect.domainId })
      .then(result => {
        return !!result;
      })
      .catch(err => {
        throw err;
      });
  },
};
