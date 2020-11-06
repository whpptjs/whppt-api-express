const assert = require('assert');

module.exports = {
  authorise({ $roles }, { user }) {
    // maybe have somewhere to set site permissions for specific actions, eg. create rolls
    return $roles.validate({ user, requiredRoles: ['root'] });
  },
  exec({ $roles }, { page, collection, roles = [] }) {
    assert(page, 'Please provide a page');
    assert(roles.length, 'Please provide at least 1 role');

    // how do we know what collection page belongs to?
    // we dont have access to pageType from plugin on the api side
    // maybe accept it as arg?

    // assign role to page and save

    // save the page with the new roles
    return false;
  },
};
