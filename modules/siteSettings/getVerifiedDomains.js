module.exports = {
  exec({ $email: { getDomainList } }) {
    return getDomainList();
  },
};
