import { ContactEmailContent } from '../sendContactEmail';
import { layout } from './layout';

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

  const template = /* HTML */ `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="650"
      style="background-color: #242424">
      <tr>
        <td valign="top" style="padding:35px">
          <p
            style="font-family:'Arial',sans-serif;font-size:16px;line-height:18px;color:#ffffff;font-weight:400;">
            ${sender}${contactEmail}
          </p>
          <p
            style="font-family:'Arial',sans-serif;font-size:16px;line-height:18px;color:#ffffff;font-weight:400;">
            ${phoneNumber}
          </p>
          <p
            style="font-family:'Arial',sans-serif;font-size:16px;line-height:18px;color:#ffffff;font-weight:400;">
            ${enquiryReason}
          </p>
          <p
            style="font-family:'Arial',sans-serif;font-size:16px;line-height:18px;color:#ffffff;font-weight:400;">
            ${contactComments}
          </p>
        </td>
      </tr>
    </table>
  `;

  return layout(template);
}
