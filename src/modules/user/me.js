module.exports = {
  exec(__, { user }) {
    // User authenticated and loaded via $security middleware injected into req (args)
    return Promise.resolve({ user });
  },
};
