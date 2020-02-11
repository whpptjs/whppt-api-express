const assert = require('assert');

module.exports = {
  exec({ $id, $mongo: { $save } }, { footer }) {
    assert(footer, 'A Footer Object must be provided.');

    footer._id = footer._id || 'footer';
    return $save('site', footer).then(() => footer);
  },
};
