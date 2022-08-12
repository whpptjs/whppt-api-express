const assert = require('assert');
const { pick } = require('lodash');

module.exports = () => {
  return function (user) {
    return Promise.resolve(user._id === 'Guest');
  };
};
