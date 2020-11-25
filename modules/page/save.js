const assert = require('assert');

module.exports = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.editorRoles]);
  },
  exec({ $id, $mongo: { $save } }, { page, collection }) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection.');

    page._id = page._id || $id();

    return $save(collection, page).then(() => page);
  },
};
