const assert = require('assert');

const { publishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.publisherRoles]);
  },
  exec({ $id, $mongo: { $publish, $save } }, { page, collection }) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection');

    page._id = page._id || $id();
    page.published = true;

    return $save(collection, page).then(savedPage => {
      return $publish(collection, savedPage).then(publishedPage => {
        if (!publishCallBack) return publishedPage;

        return publishCallBack(page).then(() => publishedPage);
      });
    });
  },
};
