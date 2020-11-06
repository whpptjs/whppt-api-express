const assert = require('assert');
const { map, uniq } = require('lodash');

module.exports = {
  authorise({ $roles, $mongo: { $save } }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $mongo: { $save } }, args) {
    const { roles = [], selectedUser } = args;
    assert(roles.length, 'Please provide at least one role.');
    assert(selectedUser, 'Please provide a user to apply the roles to.');

    const roleIds = map(roles, r => (r._id ? r._id : r));

    // probably should check to make sure all roles exist in roles collection

    selectedUser.roles = selectedUser.roles ? uniq([...selectedUser.roles, ...roleIds]) : [...roleIds];

    return $save('users', selectedUser).then(() => selectedUser);
  },
};
