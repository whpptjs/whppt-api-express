module.exports = {
  exec({ $mongo: { $db } }, { redirect }) {
    return $db
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
