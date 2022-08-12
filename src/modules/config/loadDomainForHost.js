module.exports = {
  exec({ $mongo: { $db } }, { hostname }) {
    return $db.collection('domains').findOne({ hostNames: hostname });
  },
};
