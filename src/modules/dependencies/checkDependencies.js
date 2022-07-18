module.exports = {
  exec({ $mongo: { $db } }, { url, imageId, type }) {
    const DEP_COLLECTION = 'dependencies';

    const href = url && !url.startsWith('/') ? `/${url}` : url;
    const findQuery = type === 'link' ? { href, type } : { imageId, type };

    return $db.collection(DEP_COLLECTION).find(findQuery).toArray();
  },
};
