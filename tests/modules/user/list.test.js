const sinon = require('sinon');
const { internet, date, datatype } = require('faker');
const listUsers = require('../../../modules/user/list');

test('can list all users', () => {
  const users = [];

  for (let i = 0; i < 5; i++) {
    const user = {
      _id: datatype.uuid(),
      username: internet.userName(),
      email: internet.email(),
      createdAt: date.past(),
      updatedAt: date.past(),
    };

    users.push(user);
  }

  const collection = {
    find: sinon.fake.returns({
      toArray: sinon.fake.resolves(users),
    }),
  };

  const context = {
    $mongo: {
      $db: {
        collection: sinon.fake.returns(collection),
      },
    },
  };

  const args = {};

  return listUsers.exec(context, args).then(response => {
    expect(context.$mongo.$db.collection.firstArg).toBe('users');
    expect(collection.find.firstArg).toStrictEqual({ _id: { $ne: 'guest' } });
    expect(response.users.length).toEqual(5);
  });
});
