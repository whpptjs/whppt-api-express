module.exports = {
  exec({ $mongo: { $db } }, { domainId }) {
    if (!domainId || domainId === 'undefined') return Promise.reject({ status: 500, message: 'Error: no domain found' });
    const query = { _id: `footer_${domainId}`, domainId };

    return $db
      .collection('site')
      .findOne(query)
      .then(footer => {
        if (!footer) {
          return { _id: `footer_${domainId}`, domainId };
        }
        return footer;
      });
  },
};
