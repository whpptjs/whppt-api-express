const sinon = require('sinon');
const applyToPage = require('../../../modules/roles/applyToPage');

test('roles can be applied to page with correct levels', () => {
  const page = {
    _id: 'my-page',
    editorRoles: [],
    publisherRoles: [],
  };

  const editorRole = {
    _id: 'najosfd78',
    name: 'Editor',
    level: 'editor',
  };

  const publisherRole = {
    _id: 'nkjau3i4',
    name: 'Publisher',
    level: 'publisher',
  };

  const $mongo = {
    $save: sinon.fake.resolves(),
  };

  const context = {
    $mongo,
  };

  return applyToPage.exec(context, { page, collection: 'page', roles: [editorRole, publisherRole] }).then(response => {
    expect(response.editorRoles.length).toEqual(1);
    expect(response.publisherRoles.length).toEqual(1);

    expect(response.editorRoles).toContain(editorRole._id);
    expect(response.publisherRoles).toContain(publisherRole._id);
  });
});
