module.exports = {
  exec({ $mongo: { $db } }, { hostname }) {
    console.log('🚀 ~ file: loadDomainForHost.js ~ line 3 ~ exec ~ hostname', hostname);
    return $db
      .collection('domains')
      .findOne({ hostNames: hostname })
      .then(result => {
        console.log(
          '🚀 ~ file: loadDomainForHost.js ~ line 7 ~ return$db.collection ~ result',
          result
        );
        return result;
      });
  },
};
