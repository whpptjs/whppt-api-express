module.exports = {
  authorise({ $roles }, { user }) {
    // TODO: update to allow other roles besides root
    return $roles.validate(user, ['root']);
  },
  exec({ $mongo: { $db } }) {
    return $db
      .collection('roles')
      .find()
      .toArray()
      .then(roles => {
        return { roles, total: roles.length };
      });
  },
};
