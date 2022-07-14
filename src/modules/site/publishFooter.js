const assert = require('assert');

module.exports = {
  exec({ $mongo: { $save, $publish, $startTransaction, $record } }, { footer, user }) {
    assert(footer, 'A Footer Object must be provided.');
    footer._id = footer._id || 'footer';

    return $startTransaction(async session => {
      await $save('site', footer, { session });
      await $publish('site', footer, { session });
      await $record('site', 'publish', { data: footer, user }, { session });
    }).then(() => footer);
  },
};
