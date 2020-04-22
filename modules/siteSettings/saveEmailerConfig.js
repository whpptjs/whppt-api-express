const { get } = require('lodash');

module.exports = {
  exec({ $mongo: { $save, $fetch } }, { emailerConfig }) {
    if (emailerConfig._id)
      return $fetch('site', 'emailerConfig').then(savedConfig => {
        const savedPassword = get(savedConfig, 'config.auth.pass');
        if (savedPassword && !get(emailerConfig, 'config.auth.pass')) emailerConfig.config.auth.pass = savedPassword;
        return $save('site', emailerConfig).then(() => {
          return emailerConfig;
        });
      });
    emailerConfig._id = 'emailerConfig';
    return $save('site', emailerConfig).then(() => {
      return emailerConfig;
    });
  },
};
