const assert = require('assert');

module.exports = {
  exec({ $id, $mongo: { $save } }, { page, collection }) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection.');

    page._id = page._id || $id();
    return $save(collection, page).then(() => page);
  },
};
