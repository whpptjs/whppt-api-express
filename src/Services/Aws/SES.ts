// TODO: Check if we need this. Commented for a later check. Had to export something to make it a valid module
export const foo = 'bar';
// import aws from 'aws-sdk';

// // TODO: Implement as the AwsApi email provider

// export const SES = () => {
//   const ses = new aws.SES();

//   return {
//     sendEmail(args: {
//       from: string;
//       to: string;
//       cc: string;
//       subject: string;
//       html: string;
//     }) {
//       const params = {
//         Destination: {
//           ToAddresses: [args.to],
//           CcAddresses: [args.cc],
//         },
//         Message: {
//           Body: {
//             Html: {
//               Charset: 'UTF-8',
//               Data: args.html,
//             },
//           },
//           Subject: {
//             Charset: 'UTF-8',
//             Data: args.subject,
//           },
//         },
//         Source: args.from,
//       };

//       return ses.sendEmail(params).promise();
//     },

//     getDomainIdentities() {
//       return ses
//         .listIdentities({
//           IdentityType: 'Domain',
//         })
//         .promise()
//         .then(({ Identities }) => {
//           if (Identities.length < 1) return [];
//           return ses
//             .getIdentityVerificationAttributes({ Identities })
//             .promise()
//             .then(({ VerificationAttributes }) =>
//               Object.keys(VerificationAttributes).filter(
//                 domain => VerificationAttributes[domain].VerificationStatus === 'Success'
//               )
//             );
//         });
//     },
//   };
// };
