const assert = require('assert');

module.exports = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.publisherRoles]);
  },
  exec({ $id, $mongo: { $publish, $save }, $publishing }, { page, collection }) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection');

    page._id = page._id || $id();
    page.published = true;

    return $save(collection, page).then(savedPage => {
      return $publish(collection, savedPage).then(publishedPage => {
        if (!$publishing.onPublish) return publishedPage;

        return $publishing.onPublish(page).then(() => publishedPage);
      });
    });
  },
};
