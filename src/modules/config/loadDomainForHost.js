module.exports = {
  exec({ $mongo: { $db } }, { hostname }) {
    return $db
      .collection('domains')
      .findOne({ hostNames: hostname })
      .then(result => {
        console.log('🚀 ~ file: loadDomainForHost.js ~ line 7 ~ exec ~ result', result);
        return result;
      });
  },
};
