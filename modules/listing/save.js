module.exports = {
  exec({ $mongo: { $save } }, params) {
    const { listing } = params;

    return $save('listings', listing);
  },
};
