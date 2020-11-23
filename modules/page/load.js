const assert = require('assert');

module.exports = {
  authorise({ $roles, $mongo: { $db } }, { user, slug, collection }) {
    return $db
      .collection(collection)
      .findOne({ slug }, { editorRoles: true, publisherRoles: true })
      .then(page => {
        console.log('user', user);
        console.log('page', page);
        return $roles.validate(user, [page.viewerRoles]);
      });
  },
  exec({ $mongo: { $db } }, { slug, collection }) {
    assert(collection, 'Please provide a collection.');

    return $db
      .collection(collection)
      .findOne({ slug })
      .then(page => {
        if (!page) return { status: 404, message: 'Page not found' };
        return page;
      })
      .catch(err => {
        throw err;
      });
  },
};
