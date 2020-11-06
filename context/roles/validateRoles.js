module.exports = () => {
  return function(user, requiredRoles) {
    if (!user) return false;

    if (user.roles.includes('root')) return Promise.resolve();

    const compareArrays = (arr, target) => target.every(v => arr.includes(v));

    if (!compareArrays(user.roles, requiredRoles)) {
      return Promise.reject({ status: 401, message: 'Unauthorised: Missing required role(s)' });
    }

    return Promise.resolve();
  };
};
