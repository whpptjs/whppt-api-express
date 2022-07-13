module.exports = {
  exec({ $sitemap }, args) {
    return $sitemap.filter(args);
  },
};
