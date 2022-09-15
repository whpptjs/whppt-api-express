const sinon = require('sinon');
const applyToUser = require('../../../src/modules/roles/applyToUser');

test('role can be applied to user', () => {
  const role = {
    _id: 'najosfd78',
    name: 'Tester',
  };

  const user = {
    _id: 'sdkfjns8',
    roles: [],
  };

  const $mongo = {
    $save: sinon.fake.resolves(),
  };

  const context = {
    $mongo,
  };

  return applyToUser
    .exec(context, { roles: [role], selectedUser: user })
    .then(response => {
      expect(response.roles).toContain(role._id);
    });
});
