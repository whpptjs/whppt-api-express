module.exports = {
  exec({ $mongo: { $db } }, { hostname }) {
    console.log('🚀 DOMAIN hostname Looking up', hostname);
    return $db
      .collection('domains')
      .findOne({ hostNames: hostname })
      .then(result => {
        console.log('🚀 DOMAIN hostname Result', result);
        return result;
      });
  },
};
