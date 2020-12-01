module.exports = () => {
  return function(user, requiredRoles = []) {
    if (!user) return Promise.reject();

    if (user.roles.includes('root') || requiredRoles.length < 1) return Promise.resolve();

    if (!compareArrays(user.roles, requiredRoles)) {
      return Promise.reject({ status: 401, message: 'Unauthorised: Missing required role(s)' });
    }

    return Promise.resolve();
  };
};

function compareArrays(arr, target) {
  return target.every(v => arr.includes(v));
}
