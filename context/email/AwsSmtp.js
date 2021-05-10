const assert = require('assert');
const nodemailer = require('nodemailer');

module.exports = ({ $logger, $env }) => {
  assert($env.SMTP_HOST, 'Env var SMTP_HOST is required');
  assert($env.SMTP_PORT, 'Env var SMTP_PORT is required');
  assert($env.SMTP_AUTH_USER, 'Env var SMTP_AUTH_USER is required');
  assert($env.SMTP_AUTH_PASS, 'Env var SMTP_AUTH_PASS is required');
  assert($env.EMAIL_FROM_NAME, 'Env var EMAIL_FROM_NAME is required');
  assert($env.EMAIL_FROM_ADDRESS, 'Env var EMAIL_FROM_ADDRESS is required');

  const transportOptions = {
    host: $env.SMTP_HOST,
    port: $env.SMTP_PORT,
    secure: $env.SMTP_SECURE ? $env.SMTP_SECURE === 'true' : false,
    requireTLS: $env.SMTP_TLS ? $env.SMTP_TLS === 'true' : true,
    auth: {
      user: $env.SMTP_AUTH_USER,
      pass: $env.SMTP_AUTH_PASS,
    },
  };
  if ($env.SMTP_TLS_CIPHERS) {
    transportOptions.tls = { ciphers: $env.SMTP_TLS_CIPHERS };
  }
  const defaults = {
    from: `${$env.EMAIL_FROM_NAME} <${$env.EMAIL_FROM_ADDRESS}>`,
  };

  const send = function (email) {
    $logger.info('Sending Email: %o', email);
    const transporter = nodemailer.createTransport(transportOptions, defaults);

    return new Promise((resolve, reject) => {
      return transporter.sendMail(email, error => {
        if (error) {
          $logger.error('Email Failed: %o', email);
          return reject(error);
        }

        $logger.info('Email Sent: %o', email);

        return resolve({ status: 200, message: 'Email sent' });
      });
    });
  };

  return { send };
};
