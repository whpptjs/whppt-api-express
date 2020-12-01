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

    return $save(collection, page).then(() => {
      return $publish(collection, page).then(() => {
        if (!publishCallBack) return page;

        return publishCallBack(page).then(() => page);
      });
    });
  },
};
