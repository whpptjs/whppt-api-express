module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, ['root']);
  },
  exec({ $mongo: { $db } }, args) {
    return $db
      .collection('users')
      .find({ _id: { $ne: 'guest' } }) // remove guest, not a real user
      .toArray()
      .then(users => {
        return { users, total: users.length };
      });
  },
};
