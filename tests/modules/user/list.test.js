const sinon = require('sinon');
const { random, internet, date } = require('faker');
const listUsers = require('../../../modules/user/list');

test.skip('can list all users', () => {
  const users = [];

  for (let i = 0; i < 5; i++) {
    const user = {
      _id: random.uuid(),
      username: internet.userName(),
      email: internet.email(),
      createdAt: date.past(),
      updatedAt: date.past(),
    };

    users.push(user);
  }

  const context = {
    $mongo: {
      $db: {
        collection: collection => sinon.fake.resolves(collection),
        find: () => sinon.fake.resolves(users),
        toArray: () => sinon.fake.resolves(users),
      },
    },
  };

  const args = {};

  return listUsers.exec(context, args).then(response => {
    console.log(response);
  });
});
