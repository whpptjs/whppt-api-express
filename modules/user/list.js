module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, ['root']);
  },
  exec({ $mongo: { $db } }, args) {
    return $db.collection('users').find().toArray();
  },
};
