module.exports = {
  exec({ $mongo: { $save } }, { siteSettings }) {
    // siteSettings._id = 'siteSettings';

    return $save('site', siteSettings);
    // return $db.collection('site').updateOne({ _id: 'siteSettings' }, { $set: siteSettings }, { upsert: true });
  },
};
