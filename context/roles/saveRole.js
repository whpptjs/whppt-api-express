const assert = require('assert');

module.exports = ({ $id, $mongo: { $db } }) => {
  return function({ role, user }) {
    assert(role, 'A role is required');

    if (!role._id) role._id = $id();
    role.createdAt = role.createdAt ? new Date(role.createdAt) : new Date();
    role.updatedAt = new Date();
    role.createdBy = user;

    return $db
      .collection('roles')
      .updateOne({ _id: role._id }, { $set: role }, { upsert: true })
      .then(() => role);
  };
};