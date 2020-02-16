const assert = require('assert');

module.exports = {
  exec({ $id, $mongo: { $save } }, { nav }) {
    assert(nav, 'A Nav Object must be provided.');

    nav._id = nav._id || 'nav';
    return $save('site', nav).then(() => nav);
  },
};
