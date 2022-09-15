const assert = require('assert');

module.exports = {
  exec(
    { whpptOptions = {}, $env, $security, $email, $mongo: { $db, $save } },
    { email }
  ) {
    const { emailTemplates = {} } = whpptOptions;
    const { forgotPassword = defaultForgotPassword } = emailTemplates;

    return $db
      .collection('users')
      .findOne({ email: new RegExp(`^${email}$`, 'iu') })
      .then(user => {
        assert(user, `user with email ${email} not found.`);

        return $security.generateAccessToken(user._id).then(({ token, tokenExpiry }) => {
          user.passwordResetToken = { token, tokenExpiry };

          return $save('users', user).then(() => {
            const resetLink = `${$env.BASE_URL}/?token=${token}&email=${email}`;

            return forgotPassword({ user, resetLink }).then(html => {
              const mail = {
                to: `${user.username} <${user.email}>`,
                subject: 'Password Reset',
                text: resetLink,
                html,
              };

              return $email.send(mail).then(() => ({ message: 'Success' }));
            });
          });
        });
      });
  },
};

const defaultForgotPassword = ({ resetLink }) => {
  return Promise.resolve().then(() => {
    return `
        <html lang="en">
            <body>
                <div>
                    <p>You have requested to change your password, click <a href="${resetLink}">here</a> to continue the process.</p>
                    <p>Having problems with the above link? copy the following link into your browser: 
                        <br />
                        ${resetLink}
                    </p>
                </div>  
            </body>
        </html>
    `;
  });
};
