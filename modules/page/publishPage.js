const assert = require('assert');

module.exports = {
  exec({ $id, $mongo: { $publish, $save } }, { page }) {
    assert(page, 'A Page Object must be provided.');

    page._id = page._id || $id();
    return $save('pages', page).then(() => {
      return $publish('pages', page).then(() => page);
    });
  },
};
