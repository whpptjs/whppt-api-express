module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, [], true);
  },
  exec({ $mongo: { $save } }, { siteSettings }) {
    // siteSettings._id = 'siteSettings';

    return $save('site', siteSettings);
  },
};
