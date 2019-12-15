module.exports = {
  exec({ user }) {
    return Promise.resolve({ user: req.user });
  },
};
