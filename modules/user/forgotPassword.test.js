const cmd = require('./forgotPassword');

test('Should send forgot password email with saved user tokens', () => {
  const email = 'testEmail';
  const user = { _id: 'testUser', username: 'testUser', email };

  const findOne = () => Promise.resolve(user);
  const collection = () => ({ findOne });
  const $db = { collection };
  const $save = jest.fn(() => Promise.resolve());

  const context = {
    whpptOptions: { emailTemplates: { forgotPassword: jest.fn(() => Promise.resolve('htmlString')) } },
    $env: { BASE_URL: 'http://test.com' },
    $security: { generateAccessToken: () => Promise.resolve({ token: 'testToken', tokenExpiry: 'testExpiry' }) },
    $email: { send: jest.fn(mail => Promise.resolve({})) },
    $mongo: { $db, $save },
  };

  return cmd.exec(context, { email }).then(response => {
    const emailToSend = context.$email.send.mock.calls[0][0];
    const [expectedCollection, expectedUserToSave] = context.$mongo.$save.mock.calls[0];
    const passwordResetToken = expectedUserToSave.passwordResetToken;
    const forgotPasswordArgs = context.whpptOptions.emailTemplates.forgotPassword.mock.calls[0][0];

    expect(response.message).toBe('Success');
    expect(emailToSend.html).toBe('htmlString');
    expect(emailToSend.to).toBe(`testUser <testEmail>`);
    expect(expectedCollection).toBe('users');
    expect(expectedUserToSave).toBe(user);
    expect(passwordResetToken.token).toBe('testToken');
    expect(passwordResetToken.tokenExpiry).toBe('testExpiry');
    expect(forgotPasswordArgs.resetLink).toBe('http://test.com/?token=testToken&email=testEmail');
  });
});

// test('errors if user with email doesnt exist');
