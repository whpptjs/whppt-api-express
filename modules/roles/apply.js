module.exports = {
  authorise({ $roles }, { user }) {
    // likely need to reassess using id for assigned/requiredRoles
    const adminRoleId = '1cuykh01mk02';

    return $roles.validate({ user, requiredRoles: [adminRoleId] });
  },
  exec({ $roles }, { role, user }) {
    return $roles.apply({ role, user });
  },
};
