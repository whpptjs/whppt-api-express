const assert = require('assert');
const { publishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $id, $mongo: { $publish, $save } }, { page }) {
    assert(page, 'A Page Object must be provided.');

    page._id = page._id || $id();
    return $save('pages', page).then(() => {
      return $publish('pages', page).then(() => {
        if (publishCallBack) return page;
        return publishCallBack(page).then(() => page);
      });
    });
  },
};
