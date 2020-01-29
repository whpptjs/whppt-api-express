const assert = require('assert');
const { collections } = require(process.cwd() + '/whppt.config.js');

module.exports = {
  exec({ $id, $mongo: { $save } }, { page, collection }) {
    const _collection = collections[collection];
    assert(_collection, `Collection ${collection} does not exist.`);
    assert(page, 'A Page Object must be provided.');

    page._id = page._id || $id();
    return $save('pages', page).then(() => page);
  },
};
