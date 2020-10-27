module.exports = {
  exec(__, { user }) {
    return Promise.resolve({ user });
  },
};
