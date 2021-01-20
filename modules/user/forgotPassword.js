const assert = require('assert');

module.exports = {
  exec({ $env, $security, $email, $mongo: { $db, $save } }, { email }) {
    return $db
      .collection('users')
      .findOne({ email })
      .then(user => {
        assert(user, `user with email ${email} not found.`);

        // check for active Email config - if not return error
        // hmm not sure how we can do this just yet...

        return $security.generateAccessToken(user._id).then(({ token, tokenExpiry }) => {
          user.passwordResetToken = { token, tokenExpiry };

          return $save('users', user).then(() => {
            const resetLink = `${$env.BASE_URL}/?token=${token}&email=${email}`;

            const html = `
                <html lang="en">
                    <body>
                        <div>
                            <p>you have requested to change your password, click <a href="${resetLink}">here</a> to continue the process.</p>
                            <p>Having problems with the above link? copy the following link into your browser: 
                                <br />
                                ${resetLink}
                            </p>
                        </div>  
                    </body>
                </html>
            `;

            const mail = {
              from: 'Default <mail@yourdomain.com>',
              to: `${user.username} <${user.email}>`,
              subject: 'Password Reset',
              text: resetLink,
              html,
            };

            return $email.send(mail).then(() => ({ message: 'Success' }));
          });
        });
      });
  },
};
