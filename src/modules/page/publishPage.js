const assert = require('assert');

module.exports = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.publisherRoles]);
  },
  exec(
    { $id, $mongo: { $publish, $save, $startTransaction, $record }, $publishing },
    { page, collection, user }
  ) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection');

    page._id = page._id || $id.newId();
    page.published = true;
    page.lastPublished = new Date();

    if (page.header && page.header.startDate)
      page.header.startDate = new Date(page.header.startDate);
    if (page.header && page.header.endDate)
      page.header.endDate = new Date(page.header.endDate);

    let publishedPage = page;

    return $startTransaction(async session => {
      const savedPage = await $save(collection, page, { session });
      publishedPage = await $publish(collection, savedPage, { session });
      await $record(collection, 'publish', { data: publishedPage, user }, { session });
      if ($publishing.onPublish) await $publishing.onPublish(page);
    }).then(() => publishedPage);
  },
};
