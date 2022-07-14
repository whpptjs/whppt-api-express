const assert = require('assert');

module.exports = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.publisherRoles]);
  },
  exec({ $id, $mongo: { $publish, $save, $startTransaction, $record }, $publishing }, { page, collection, user }) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection');

    page._id = page._id || $id();
    page.published = true;

    return $startTransaction(async session => {
      const savedPage = await $save(collection, page, { session });
      const publishedPage = await $publish(collection, savedPage, { session });
      await $record(collection, 'publish', { data: publishedPage, user }, { session });
      if ($publishing.onPublish) await $publishing.onPublish(page);
    });
  },
};
