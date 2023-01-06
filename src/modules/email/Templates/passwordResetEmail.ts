import { headers, footer } from './layoutTemplates';

export function resetPasswordTemplate(recoveryPageLink: string) {
  return /* HTML */ `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="800"
      style="background-color: #F6F6F4">
      ${headers('Reset password')}
      <tr>
        <td valign="top" style="padding:35px">
          <p style="font-size:16px">
            Someone requested that the password be reset for your account.
          </p>
          <p style="font-size:16px">
            If this was a mistake, just ignore this email and nothing will happen.
          </p>
          <p style="font-size:16px">
            Reset your password click this link
            <a style="color:#9D7837;" href=${recoveryPageLink}>here</a>
          </p>
          ${footer}
        </td>
      </tr>
    </table>
  `;
}
