module.exports = awsSDK => {
  const ses = new awsSDK.SES();

  const sendEmail = ({ to, subject, html }) => {
    console.log('sendEmail -> to', to);
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
      Source: 'ethan@sveltestudios.com', // placeholder
    };

    return ses.sendEmail(params).promise();
  };

  const getDomainIdentities = () => {
    return ses
      .listIdentities({
        IdentityType: 'Domain',
      })
      .promise()
      .then(({ Identities }) => {
        if (Identities.length < 1) return [];
        return ses
          .getIdentityVerificationAttributes({ Identities })
          .promise()
          .then(({ VerificationAttributes }) => Object.keys(VerificationAttributes).filter(domain => VerificationAttributes[domain].VerificationStatus === 'Success'));
      });
  };

  return { sendEmail, getDomainIdentities };
};
