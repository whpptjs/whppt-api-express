const assert = require('assert');

module.exports = {
  exec({ $mongo: { $save, $publish, $startTransaction, $record } }, { nav, user }) {
    assert(nav, 'A Nav Object must be provided.');
    nav._id = nav._id || 'nav';

    return $startTransaction(async session => {
      await $save('site', nav, { session });
      await $publish('site', nav, { session });
      await $record('site', 'publish', { data: nav, user }, { session });
    }).then(() => nav);
  },
};
