module.exports = {
  exec({ $mongo: { $publish, $startTransaction, $record } }, { siteSettings, user }) {
    return $startTransaction(async session => {
      await $publish('site', siteSettings, { session });
      await $record('site', 'publish', { data: siteSettings, user }, { session });
    });
  },
};
