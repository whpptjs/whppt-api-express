const assert = require('assert');

module.exports = {
  authorise(context, params) {
    //

    return Promise.reject('Not authorised to perform this action.');
  },
  exec({ $id, $mongo: { $save } }, role) {
    assert(role, 'A Nav Object must be provided.');

    if (!role._id) role._id = $id();

    return $save('roles', role).then(() => role);
  },
};
