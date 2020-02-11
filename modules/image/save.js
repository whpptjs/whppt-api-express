module.exports = {
  exec({ $mongo: { $save } }, params) {
    const { image } = params;

    return $save('images', image);
  },
};
