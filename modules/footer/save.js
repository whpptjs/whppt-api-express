const assert = require('assert');

module.exports = {
  exec({ $id, $mongo: { $save } }, { footer }) {
    assert(footer, 'A Footer Object must be provided.');

    footer._id = footer._id || 'draft_footer';
    return $save('footer', footer).then(() => footer);
  },
};
