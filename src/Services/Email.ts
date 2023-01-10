// import {
//   SESv2Client,
//   SendEmailCommand,
//   SendEmailCommandInput,
// } from '@aws-sdk/client-sesv2';
import { ContextType } from 'src/context/Context';
// import { HttpError } from './HttpError';

export type Email = { to: string; subject: string; html: string };
export type EmailService = { send: (email: Email) => Promise<void> };
export type EmailServiceConstructor = (context: ContextType) => Promise<EmailService>;

export const EmailService: EmailServiceConstructor = ({ $hosting, $logger }) => {
  console.log('🚀 ~ file: Email.ts:14 ~ $logger', $logger);
  return $hosting.then(({ email }) => {
    console.log('🚀 ~ file: Email.ts:74 ~ return$hosting.then ~ email', email);

    // const region = email.region;
    // const accessKeyId = email.accessKeyId;
    // const secretAccessKey = email.secretAccessKey;
    // const fromAddress = email.fromAddress;
    // const feedbackAddress = email.feedbackAddress;

    // if (!region) throw new HttpError(500, 'AWS_REGION is required');
    // if (!accessKeyId) throw new HttpError(500, 'AWS_ACCESS_KEYID is required');
    // if (!secretAccessKey) throw new HttpError(500, 'AWS_SECRET_ACCESS_KEY is required');

    // const clientConfig = {
    //   region,
    //   credentials: {
    //     accessKeyId,
    //     secretAccessKey,
    //   },
    // };
    // $logger.dev('Configuring email client: %o', clientConfig);
    // const client = new SESv2Client(clientConfig);
    return {
      send: async email => {
        console.log('🚀 ~ file: Email.ts:75 ~ return$hosting.then ~ email', email);

        // if (!fromAddress)
        //   throw new HttpError(
        //     500,
        //     'Cannot send email without a from address. Check env.EMAIL_FROM_ADDRESS'
        //   );
        // if (!feedbackAddress)
        //   throw new HttpError(
        //     500,
        //     'Cannot send email without a feedback address. Check env.EMAIL_FEEDBACK_ADDRESS'
        //   );
        // const input: SendEmailCommandInput = {
        //   FromEmailAddress: fromAddress,
        //   Destination: {
        //     ToAddresses: [email.to],
        //     // CcAddresses: [],
        //     // BccAddresses: [],
        //   },
        //   // ReplyToAddresses: [],
        //   FeedbackForwardingEmailAddress: feedbackAddress,
        //   Content: {
        //     Simple: {
        //       Subject: { Data: email.subject },
        //       Body: { Html: { Data: email.html } },
        //     },
        //   },
        // };
        // $logger.dev('Sending email: %o', input);
        // input.Content.Simple.Body.Html.Data = email.html;
        // await client
        //   .send(new SendEmailCommand(input))
        //   .then(() => $logger.dev('Email sent ok'))
        //   .catch(err => {
        //     $logger.warning('Email send fialure', err);
        //     throw new HttpError(500, `Email could not be sent. ${err.message}`);
        //   });
      },
    };
  });
};
