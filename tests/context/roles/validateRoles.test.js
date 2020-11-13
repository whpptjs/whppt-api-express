const ValidateRoles = require('../../../context/roles/ValidateRoles');

describe('', () => {
  test('can validate AND roles', () => {
    const user = {
      roles: ['role1', 'role2'],
    };
    const requiredRoles = [['role1'], ['role2']];

    const validate = ValidateRoles();

    return validate(user, requiredRoles).then(() => {
      expect(true);
    });
  });

  test('can validate OR roles', () => {
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
});
