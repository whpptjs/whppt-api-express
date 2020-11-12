const sinon = require('sinon');
const listRoles = require('../../../modules/roles/list');

test.skip('can list roles for user', () => {
  const $mongo = {
    $db: sinon.fake.resolves(),
  };

  const context = {
    $mongo,
  };

  return listRoles.exec(context).then(response => {});
});
