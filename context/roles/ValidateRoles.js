const { map, intersection } = require('lodash');

module.exports = () => {
  return function (user, requiredRoles = []) {
    if (!process.env.DRAFT || process.env.DRAFT === 'false') return Promise.resolve();

    if (!userHasRoles(user)) return Promise.reject({ status: 401, message: 'Unauthorised: Missing required role(s)' });

    if (hasRootRole(user) || doesNotRequireRoles(requiredRoles)) return Promise.resolve();

    if (!checkAndRoles(checkOrRoles(user.roles, requiredRoles))) {
      return Promise.reject({ status: 401, message: 'Unauthorised: Missing required role(s)' });
    }

    return Promise.resolve();
  };
};

function checkOrRoles(userRoles, requiredRoles) {
  return map(requiredRoles, required => !!intersection(required, userRoles).length);
}

function checkAndRoles(orResults) {
  return orResults.every(v => v === true);
}

function hasRootRole(user) {
  if (user.roles.includes('root')) return true;
}

function doesNotRequireRoles(requiredRoles) {
  return requiredRoles.length < 1;
}

function userHasRoles(user) {
  return user && user.roles;
}
