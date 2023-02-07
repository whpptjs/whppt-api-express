import { headers } from './headers';
import { footer } from './footer';

export const layout = (content: any, link?: string) => {
  return /* HTML */ `
    ${headers(link)}
    <body class="em_body" style="margin:0px auto; padding:0px;" bgcolor="#E1E1E1">
      <tr>
        <td
          align="center"
          valign="top"
          background="https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/57f02b34-4017-43c9-bac6-28c3b2a90a8d.jpg"
          height="507"
          style="height:507px; background-position:center top; background-repeat:no-repeat;">
          <table
            width="650"
            style="width:650px; "
            border="0"
            cellspacing="0"
            cellpadding="0"
            align="center"
            class="em_wrapper">
            <tr>
              <td width="20" style="width:20px;" class="em_side15">&nbsp;</td>
              <td align="center" valign="top">
                <table
                  width="610"
                  style="width:610px; "
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  align="center"
                  class="em_wrapper">
                  <tr>
                    <td height="15" style="height:15px; font-size:0px; line-height:0px;">
                      <img
                        src="https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif"
                        width="1"
                        height="1"
                        alt=""
                        border="0"
                        style="display:block;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" valign="top" class="em_defaultlink">
                      <a href="#" target="_blank" style="text-decoration:none;"
                        ><img
                          src="https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/dc32c4cd-756c-4a99-92f1-6f205108c0d4.png"
                          width="113"
                          alt="Hentley Farm"
                          border="0"
                          style="display:block; font-family:'Georgia', Arial, sans-serif; font-size:10px; line-height:13px; color:#ffffff; max-width:113px;"
                      /></a>
                    </td>
                  </tr>
                </table>
              </td>
              <td width="20" style="width:20px;" class="em_side15">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
      <table
        width="100%"
        border="0"
        cellspacing="0"
        cellpadding="0"
        class="em_full_wrap em_body"
        bgcolor="#E1E1E1"
        style="table-layout:fixed;">
        ${content}
      </table>
      ${footer}
    </body>
  `;
};
