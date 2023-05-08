export const staff = (staffContactInfo: any) => {
  return staffContactInfo
    ? [
        {
          layout: 'noBorders',
          table: {
            alignment: 'left',
            widths: ['*'],
            body: [
              [
                {
                  text: 'Staff:',
                  bold: true,
                  font: 'SweetSansPro',
                  style: 'shippingAddress',
                  margin: [50, 0, 0, 0],
                },
              ],
              [
                {
                  text: `Username / Id: ${
                    staffContactInfo.username || staffContactInfo._id || ''
                  }`,
                  style: 'shippingAddress',
                  margin: [50, 0, 0, 0],
                },
              ],
              [
                {
                  text: `Market Area: ${staffContactInfo.marketArea || ''}`,
                  style: 'shippingAddress',
                  margin: [50, 0, 0, 10],
                },
              ],
            ],
          },
        },
      ]
    : [];
};
