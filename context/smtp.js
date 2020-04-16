const nodemailer = require('nodemailer');

// const template = {
// from: [`' Website' <email@example.com.au>`],
// to: [`support@sveltestudios.com`],
// subject: `New Enquiry on the Website`,
// html: `
//     <p>New Enquiry on the Website from:</p>
//     <p>First Name: ${message.firstName}</p>
//     <p>Last Name: ${message.lastName}</p>
//     <p>Regarding: ${message.subject}</p>
//     <p>Message: ${message.body}</p>
//     `
// };

// return db
// .collection('settings')
// .findOne({ _id: 'emailerConfig' })

module.exports = ({ $mongo: { $db } }) => {
  return {
    sendEmail(template) {
      // fetch settings from mongo
      return $db
        .collection('site')
        .findOne({ _id: 'emailerConfig' })
        .then(emailerConfig => {
          console.log('sendEmail -> emailerConfig', emailerConfig);
          const transporter = nodemailer.createTransport(emailerConfig && emailerConfig.config);
          return new Promise((resolve, reject) => {
            return transporter.sendMail(template, error => {
              if (error) return reject(error);
              return resolve({ status: 200, message: 'Development email saved' });
            });
          });
        });
    },
  };
};
