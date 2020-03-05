module.exports = {
  exec({ $id, $mongo: { $save } }, { category }) {
    category._id = category._id || $id();
    return $save('categories', category).then(() => {
      return category;
    });
  },
};
