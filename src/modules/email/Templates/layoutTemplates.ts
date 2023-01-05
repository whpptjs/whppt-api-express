export const headers = (title: string) => /* HTML */ `
  <tr>
    <td
      style="
          position: relative;
          height: 15rem;
          padding: 35px;
          background: url('https://s3.ap-southeast-2.amazonaws.com/media.dev.hentleyfarm.svelteteam.com/images/emailHeader.png');
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;">
      <img
        style="height: 5rem;"
        src="https://s3.ap-southeast-2.amazonaws.com/media.dev.hentleyfarm.svelteteam.com/images/emailLogo.png" />
    </td>
  </tr>
  <tr>
    <td style="background-color: #000000; height: 10rem">
      <h1 style="color:#ffffff;margin-bottom: 10px; padding-left: 35px;">${title}</h1>
    </td>
  </tr>
`;

export const footer = /* HTML */ `
  <tfoot>
    <tr>
      <td
        style="
            height:60rem;
            background:url('https://s3.ap-southeast-2.amazonaws.com/media.dev.hentleyfarm.svelteteam.com/images/emailFooter.png');
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;"></td>
    </tr>
  </tfoot>
`;
