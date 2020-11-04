const assert = require('assert');
const { uniq } = require('lodash');

module.exports = ({ $mongo: { $save } }) => {
  return function({ user, role }) {
    assert(role, 'A role is required');
    assert(user, 'A user is required');

    user.roles = user.roles ? uniq([...user.roles, role._id]) : [role._id];

    return $save('users', user).then(() => user);
  };
};
