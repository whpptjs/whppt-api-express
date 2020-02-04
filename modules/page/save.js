const assert = require('assert');

module.exports = {
  exec({ $id, $mongo: { $save } }, { page }) {
    assert(page, 'A Page Object must be provided.');

    page._id = page._id || $id();
    console.log('PAGE', page);
    return $save('pages', page).then(() => page);
  },
};
