module.exports = {
  exec({ $id, $mongo: { $publish, $save } }, { category }) {
    category._id = category._id || $id();
    category.published = true;
    return $save('categories', category).then(() => {
      return $publish('categories', category).then(() => {
        return category;
      });
    });
  },
};
