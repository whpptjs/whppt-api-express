module.exports = {
  exec({ $mongo: { $db } }, { siteSettings }) {
    return $db.collection('site').updateOne({ _id: 'siteSettings' }, { $set: siteSettings }, { upsert: true });
  },
};
