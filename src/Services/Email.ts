import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-sesv2';
import { ContextType } from 'src/context/Context';
import { HttpError } from './HttpError';

export type Email = { to: string; subject: string; html: string };
export type EmailService = { send: (email: Email, attachments: any) => Promise<void> };
export type EmailServiceConstructor = (context: ContextType) => Promise<EmailService>;

export const EmailService: EmailServiceConstructor = ({ $hosting, $logger }) => {
  return $hosting.then(({ email }) => {
    const { region, accessKeyId, secretAccessKey, fromAddress, feedbackAddress } = email;

    if (!region) throw new HttpError(500, 'AWS_REGION is required');
    if (!accessKeyId) throw new HttpError(500, 'AWS_ACCESS_KEYID is required');
    if (!secretAccessKey) throw new HttpError(500, 'AWS_SECRET_ACCESS_KEY is required');

    const clientConfig = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };
    $logger.dev('Configuring email client: %o', clientConfig);
    const client = new SESv2Client(clientConfig);
    return {
      send: (email: any, attachments: any) => {
        if (!fromAddress)
          throw new HttpError(
            500,
            'Cannot send email without a from address. Check env.EMAIL_FROM_ADDRESS'
          );
        if (!feedbackAddress)
          throw new HttpError(
            500,
            'Cannot send email without a feedback address. Check env.EMAIL_FEEDBACK_ADDRESS'
          );
        const input: SendEmailCommandInput & { Attachments?: any[] } = {
          FromEmailAddress: fromAddress,
          Destination: {
            ToAddresses: [email.to],
            BccAddresses: email.bcc ? email.bcc : [],
            CcAddresses: email.cc ? email.cc : [],
          },
          FeedbackForwardingEmailAddress: feedbackAddress,
          Content: {
            Simple: {
              Subject: { Data: email.subject },
              Body: { Html: { Data: email.html } },
            },
          },
        };
        if (attachments) input.Attachments = attachments;
        $logger.dev('Sending email: %o', input);
        if (input?.Content?.Simple?.Body?.Html?.Data)
          input.Content.Simple.Body.Html.Data = email.html;
        return client
          .send(new SendEmailCommand(input))
          .then(() => $logger.dev('Email sent ok'))
          .catch((err: any) => {
            $logger.warning('Email send fialure', err);
            throw new HttpError(500, `Email could not be sent. ${err.message}`);
          });
      },
    };
  });
};
