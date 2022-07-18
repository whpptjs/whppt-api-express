const assert = require('assert');

module.exports = {
  exec({ $mongo: { $save, $publish } }, { nav }) {
    assert(nav, 'A Nav Object must be provided.');

    nav._id = nav._id || 'nav';
    return $save('site', nav).then(() => {
      return $publish('site', nav).then(() => nav);
    });
  },
};
