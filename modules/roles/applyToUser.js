const assert = require('assert');
const { map, uniq } = require('lodash');

module.exports = {
  authorise({ $roles, $mongo: { $save } }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $mongo: { $save } }, { roles = [], selectedUser }) {
    assert(selectedUser, 'Please provide a user to apply the roles to.');

    const roleIds = map(roles, r => (r._id ? r._id : r));

    // probably should check to make sure all roles exist in roles collection

    // TODO: adjust for below scenario
    // still not 100% on this approach, relies on the client to accommodate for roles such as root
    // this can currently overwrite the root users "root" role unless passed along side the other roles
    selectedUser.roles = uniq(roleIds);

    return $save('users', selectedUser).then(() => selectedUser);
  },
};
