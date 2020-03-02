const assert = require('assert');

module.exports = {
  exec({ $mongo: { $save, $publish } }, { footer }) {
    assert(footer, 'A Footer Object must be provided.');

    footer._id = footer._id || 'footer';
    return $save('site', footer).then(() => {
      return $publish('site', footer).then(() => footer);
    });
  },
};
