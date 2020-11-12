const assert = require('assert');
const { filter, map, uniq } = require('lodash');

module.exports = {
  authorise({ $roles }, { user }) {
    // maybe have somewhere to set site permissions for specific actions, eg. create rolls
    return $roles.validate(user, ['root']);
  },
  exec({ $mongo: { $save } }, { page, collection, roles = [] }) {
    assert(page, 'Please provide a page');
    assert(roles.length, 'Please provide at least 1 role');
    assert(collection, 'Please provide at the page collection');

    const editorRoles = filter(roles, r => r.level.editor);
    const publisherRoles = filter(roles, r => r.level.publisher);

    const editorRoleIds = map(editorRoles, er => er._id);
    const publisherRoleIds = map(publisherRoles, pr => pr._id);

    if (!page.editorRoles) page.editorRoles = [];
    if (!page.publisherRoles) page.publisherRoles = [];

    page.editorRoles = uniq(editorRoleIds);
    page.publisherRoles = uniq(publisherRoleIds);

    return $save(collection, page).then(() => page);
  },
};
