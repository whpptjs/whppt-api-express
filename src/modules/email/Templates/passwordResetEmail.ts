import { layout } from './layout';

export function resetPasswordTemplate(recoveryPageLink: string) {
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
            We've received a request to reset your account password. Click the link below
            to reset your password. Please note, this link will expire in 60 minutes.
          </p>
          <p
            style="font-family:'Arial',sans-serif;font-size:16px;line-height:18px;color:#ffffff;font-weight:400;">
            Not expecting this email? Don't worry! Your password is safe and you can
            ignore this email.
          </p>
          <p
            style="font-family:'Arial',sans-serif;font-size:16px;line-height:18px;color:#ffffff;font-weight:400;">
            Reset your password
            <a style="color:#9D7837;" href=${recoveryPageLink}>here</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  return layout(template);
}
