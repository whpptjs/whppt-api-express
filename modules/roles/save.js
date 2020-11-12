const assert = require('assert');

module.exports = {
  authorise({ $roles }, { user }) {
    if ($roles.validate(user, [])) return Promise.resolve();

    return Promise.reject('Not authorised.');
  },
  exec({ $id, $roles }, { role, user }) {
    assert(role, 'A Role must be provided.');

    return $roles.save({ role, user }).then(_role => _role);
  },
};
