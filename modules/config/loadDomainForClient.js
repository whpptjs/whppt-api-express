module.exports = {
  exec({ $mongo: { $db } }, _, req) {
    const refererUrl = new URL(req.headers.referer || req.headers.origin || req.headers.host);
    const clientDomainName = refererUrl.hostname;
    return $db.collection('domains').findOne({ hostNames: clientDomainName });
  },
};
