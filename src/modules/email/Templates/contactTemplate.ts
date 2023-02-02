import { ContactEmailContent } from '../sendContactEmail';
import { headers, footer } from './layoutTemplates';

export function getContactTemplate({
  firstName,
  email,
  lastName,
  phone,
  reason,
  comments,
}: ContactEmailContent) {
  const sender = `You received a message from ${firstName} ${lastName}`;
  const contactEmail = ` with contact email ${email}`;
  const phoneNumber = phone ? `Phone number: ${phone}` : '';
  const enquiryReason = `Reason for enquiry: ${reason}`;
  const contactComments = `Coments: ${comments}`;

  return `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="800"
      style="background-color: #F6F6F4">
      ${headers('Contact Form')}
      <tr>
        <td valign="top" style="padding:35px">
          <p style="font-size:16px">
            ${sender}${contactEmail}
          </p>
          <p style="font-size:16px">
            ${phoneNumber}
          </p>
          <p style="font-size:16px">
            ${enquiryReason}
          </p>
          <p style="font-size:16px">
            ${contactComments}
          </p>
          ${footer}
        </td>
      </tr>
    </table>
  `;
}
