const { map } = require('lodash');

module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, ['root'], true);
  },
  exec({ $mongo: { $db } }) {
    return $db
      .collection('users')
      .find({ _id: { $ne: 'guest' } }) // remove guest, not a real user
      .toArray()
      .then(response => {
        const users = map(response, user => ({
          _id: user._id,
          email: user.email,
          username: user.username,
          roles: user.roles,
          verified: Boolean(user.password),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));

        return { users, total: users.length };
      });
  },
};
