import { styleTags } from './styleTags';

const getLink = (link: string) => {
  return /* HTML */ ` <a
    class="ltlink"
    href=${link}
    style="font-size:10px;font-family:Arial,Helvetica,sans-serif;text-decoration:none;">
    View online
  </a>`;
};

export const headers = (link?: string) => {
  return /* HTML */ `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>Hentley Farm</title>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      ${styleTags}
      <tr>

      <td align="center" valign="top"><table align="center" width="650" border="0" cellspacing="0" cellpadding="0" class="em_main_table" style="width:650px; table-layout:fixed;">
        <tr>
          <td align="center" valign="top"><table width="650" style="width:650px;" align="center" class="em_wrapper" border="0" cellspacing="0" cellpadding="0">
          <div align="right" style="padding:5px;">
            ${link ? getLink(link) : ''}      
          </div>
        <tr>
      </td>
    </head>
  </html>
`;
};
