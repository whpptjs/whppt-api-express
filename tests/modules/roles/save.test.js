const sinon = require('sinon');
const saveRole = require('../../../modules/roles/save');

test('new role can be saved', () => {
  const roleId = 'najosfd78';

  const role = {
    name: 'Tester',
  };

  const $mongo = {
    $save: sinon.fake.resolves(),
  };

  const $id = sinon.fake.returns(roleId);

  // not sure if this is how to mock $roles service...
  const $roles = {
    save: sinon.fake.resolves({ _id: $id(), ...role }),
  };

  const context = {
    $id,
    $mongo,
    $roles,
  };

  return saveRole.exec(context, { role }).then(response => {
    expect(response._id).toEqual(roleId);
    expect(response.name).toEqual(role.name);
  });
});

test('existing roles can be updated', () => {
  const existingRole = {
    _id: 'kdfjne8',
    name: 'Tester',
  };

  const updatedRole = {
    ...existingRole,
    name: 'Publisher',
  };

  const $mongo = {
    $save: sinon.fake.resolves(),
  };

  // not sure if this is how to mock $roles service...
  const $roles = {
    save: sinon.fake.resolves(updatedRole),
  };

  const context = {
    $mongo,
    $roles,
  };

  return saveRole.exec(context, { role: updatedRole }).then(response => {
    expect(response._id).toEqual(existingRole._id);
    expect(response.name).toEqual(updatedRole.name);
  });
});
