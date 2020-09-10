const uniqid = require('uniqid');

const $id = () => uniqid.process();

module.exports = $id;
