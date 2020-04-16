module.exports = {
  exec({ $mongo: { $save } }, { emailerConfig }) {
    emailerConfig._id = emailerConfig._id || 'emailerConfig';
    return $save('site', emailerConfig).then(() => {
      return emailerConfig;
    });
  },
};
