import { headers, footer } from './layoutTemplates';

export function resetPasswordTemplate(recoveryPageLink: string) {
  return /* HTML */ `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="800"
      style="background-color: #F6F6F4">
      ${headers('Reset your password')}
      <tr>
        <td valign="top" style="padding:35px">
          <p style="font-size:16px">
            We've received a request to reset your account password. Click the link below
            to reset your password. Please note, this link will expire in 60 minutes.
          </p>
          <p style="font-size:16px">
            Not expecting this email? Don't worry! Your password is safe and you can
            ignore this email.
          </p>
          <p style="font-size:16px">
            Reset your password
            <a style="color:#9D7837;" href=${recoveryPageLink}>here</a>
          </p>
          ${footer}
        </td>
      </tr>
    </table>
  `;
}
