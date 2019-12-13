const uniqid = require('uniqid');

const $id = () => {
  return uniqid.process();
};

module.exports = $id;
