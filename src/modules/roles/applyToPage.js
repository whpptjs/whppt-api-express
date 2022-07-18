const assert = require('assert');
const { filter, map, uniq } = require('lodash');

module.exports = {
  authorise({ $roles }, { user }) {
    // maybe have somewhere to set site permissions for specific actions, eg. create rolls
    return $roles.validate(user, ['root'], true);
  },
  exec({ $mongo: { $save } }, { page, collection, roles = [] }) {
    assert(page, 'Please provide a page');
    assert(roles.length, 'Please provide at least 1 role');
    assert(collection, 'Please provide at the page collection');

    const viewerRoles = filter(roles, r => r.level.viewer);
    const editorRoles = filter(roles, r => r.level.editor);
    const publisherRoles = filter(roles, r => r.level.publisher);

    const viewerRoleIds = map(viewerRoles, er => er._id);
    const editorRoleIds = map(editorRoles, er => er._id);
    const publisherRoleIds = map(publisherRoles, pr => pr._id);

    if (!page.viewerRoles) page.viewerRoles = [];
    if (!page.editorRoles) page.editorRoles = [];
    if (!page.publisherRoles) page.publisherRoles = [];

    page.viewerRoles = uniq(viewerRoleIds);
    page.editorRoles = uniq(editorRoleIds);
    page.publisherRoles = uniq(publisherRoleIds);

    return $save(collection, page).then(() => page);
  },
};
