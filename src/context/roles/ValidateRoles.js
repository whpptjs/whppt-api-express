const { flatten, find, map, intersection } = require('lodash');

module.exports = ({ $mongo: { $db }, $env }) => {
  return function (user, requiredRoles = [], requiresAdmin = false) {
    if (!$env.draft || $env.draft === 'false') return Promise.resolve();

    const userRolesQuery = $db
      .collection('roles')
      .find({ _id: { $in: user.roles } })
      .toArray();

    const adminRolesQuery = $db
      .collection('roles')
      .find({ admin: true }, { _id: true })
      .toArray();

    return Promise.all([userRolesQuery, adminRolesQuery]).then(
      ([userRoles, adminRoles]) => {
        const firstOrRoles = requiredRoles.shift() || [];
        const firstOrRolesIncludingAdminRoles = [
          firstOrRoles,
          ...adminRoles.map(r => r._id),
        ];
        const _requiredRoles = [firstOrRolesIncludingAdminRoles, ...requiredRoles];

        if (rootRoleIsRequired(_requiredRoles) && userHasRootRole(user))
          return Promise.resolve();

        if (!userHasRoles(user))
          return Promise.reject({
            status: 403,
            message: 'Unauthorised: Missing required role(s)',
          });

        if (requiresAdmin && !hasAdminRoles(userRoles))
          return Promise.reject({
            status: 403,
            message: 'Unauthorised: Missing required role(s)',
          });

        if (
          (requiresAdmin && hasAdminRoles(userRoles)) ||
          doesNotRequireRoles(_requiredRoles)
        )
          return Promise.resolve();

        if (!checkAndRoles(checkOrRoles(user.roles, _requiredRoles))) {
          return Promise.reject({
            status: 403,
            message: 'Unauthorised: Missing required role(s)',
          });
        }

        return Promise.resolve();
      }
    );
  };
};

function checkOrRoles(userRoles, requiredRoles) {
  return map(requiredRoles, required => !!intersection(required, userRoles).length);
}

function checkAndRoles(orResults) {
  return orResults.every(v => v === true);
}

function doesNotRequireRoles(requiredRoles) {
  return requiredRoles.length < 1;
}

function userHasRoles(user) {
  return user && user.roles;
}

function rootRoleIsRequired(requiredRoles) {
  const allRequiredRoles = flatten(requiredRoles);

  return Boolean(allRequiredRoles.includes('root'));
}

function userHasRootRole(user) {
  return Boolean(user.roles && user.roles.includes('root'));
}

function hasAdminRoles(userRoles) {
  const anyRollMarkedAsAdmin = find(userRoles, r => r.admin);

  return Boolean(anyRollMarkedAsAdmin);
}
