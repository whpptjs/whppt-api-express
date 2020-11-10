const listRoles = require('../../../modules/roles/list');

test('can list roles for user', () => {
  const $mongo = {
    $db: sinon.fake.resolves(),
  };

  const context = {
    $mongo,
  };

  return listRoles.exec(context).then(response => {});
});
