const sinon = require('sinon');
const { random } = require('faker');
const listRoles = require('../../../modules/roles/list');

test('can list roles for user', () => {
  const roles = [];

  for (let i = 0; i < 5; i++) {
    const role = {
      _id: random.uuid(),
      name: random.word(),
    };

    roles.push(role);
  }

  const collection = {
    find: sinon.fake.returns({
      toArray: sinon.fake.resolves(roles),
    }),
  };

  const context = {
    $mongo: {
      $db: {
        collection: sinon.fake.returns(collection),
      },
    },
  };

  return listRoles.exec(context).then(response => {
    expect(context.$mongo.$db.collection.firstArg).toEqual('roles');
    expect(response.roles.length).toEqual(5);
  });
});
