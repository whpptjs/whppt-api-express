const assert = require('assert');

module.exports = {
  exec({ $id, $mongo: { $save } }, { page, collection }) {
    assert(page, 'A Page Object must be provided.');

    page._id = page._id || $id();
    return $save(collection, page).then(() => page);
  },
};
