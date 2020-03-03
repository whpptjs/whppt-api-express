module.exports = {
  exec({ $mongo: { $save } }, { siteSettings }) {
    return $save('site', siteSettings);
    // return $db.collection('site').updateOne({ _id: 'siteSettings' }, { $set: siteSettings }, { upsert: true });
  },
};
