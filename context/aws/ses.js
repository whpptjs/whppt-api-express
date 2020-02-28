module.exports = awsSDK => {
  const ses = new awsSDK.SES();

  const sendEmail = ({ to, subject, html, text }) => {
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      // ConfigurationSetName: "",
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html,
          },
          // Text: {
          //   Charset: "UTF-8",
          //   Data: text
          // }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: 'info@sveltestudios.com', // placeholder
    };

    return ses.sendEmail(params).promise();
  };

  return { sendEmail };
};
