const sinon = require('sinon');
const ValidateRoles = require('../../../src/context/roles/ValidateRoles');

describe('validate roles:', () => {
  test.skip('can validate AND roles', () => {
    const user = {
      roles: ['role1', 'role2'],
    };
    const requiredRoles = [['role1'], ['role2']];

    const validate = ValidateRoles();

    return validate(user, requiredRoles).then(() => {
      expect(true);
    });
  });

  test.skip('can validate OR roles', () => {
    const user = {
      roles: ['role1'],
    };
    const requiredRoles = [['role1', 'role2']];

    const validate = ValidateRoles();
    return validate(user, requiredRoles).then(() => {
      expect(true);
    });
  });

  // test that invalid roles will get rejected with error message and 401

  test('is admin roles should be included in the required roles', () => {
    const user = {
      roles: ['role1', 'admin'],
    };
    const userRoles = [
      { name: 'role1', _id: 'role1' },
      { name: 'admin', _id: 'admin' },
    ];
    const adminRoles = [{ _id: 'admin' }];
    const requiredRoles = [[]];

    const context = { $mongo: { $db: { collection: sinon.stub() } }, $env: { draft: true } };
    const find = sinon.stub();
    context.$mongo.$db.collection.withArgs('roles').returns({ find });
    find.withArgs({ _id: { $in: user.roles } }).returns({ toArray: () => Promise.resolve(userRoles) });
    find.withArgs({ admin: true }, { _id: true }).returns({ toArray: () => Promise.resolve(adminRoles) });

    const validate = ValidateRoles(context);
    return validate(user, requiredRoles).then(() => {
      expect(find.calledWith({ _id: { $in: user.roles } }));
      expect(find.calledWith({ admin: true }, { id: true }));
    });
  });
});
