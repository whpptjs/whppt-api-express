const AwsSmtp = require('./AwsSmtp');
const Fake = require('./Fake');

module.exports = context => {
  const { $env, $logger } = context;

  const providers = [AwsSmtp, Fake]; // AwsApi comming soon
  const configuredProvider = providers[$env.EMAIL_PROVIDER];
  if (!configuredProvider) $logger.warning('Missing email provider - you wont be able to send emails. Options include: AwsSmtp, AwsApi');

  return configuredProvider ? configuredProvider(context) : Fake(context);
};
