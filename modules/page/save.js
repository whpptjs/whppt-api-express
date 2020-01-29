const assert = require('assert');

module.exports = {
  exec({ $id, $mongo }, { page }) {
    assert(page, 'A Page Object must be provided.');

    page._id = page._id || $id();

    return $mongo.then(({ $db, $save }) => {
      return $save('pages', page).then(() => page);
    });
  },
};
