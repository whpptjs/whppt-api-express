module.exports = {
  exec({ $mongo: { $db } }, { domainId }) {
    const query = { _id: domainId && domainId !== 'undefined' ? `siteSettings_${domainId}` : 'siteSettings' };

    return $db
      .collection('site')
      .findOne(query)
      .then(siteSettings => {
        if (!siteSettings) {
          return { ...siteSettings, _id: domainId && domainId !== 'undefined' ? `siteSettings_${domainId}` : 'siteSettings' };
        }
        return siteSettings;
      })
      .catch(err => {
        throw err;
      });
  },
};
