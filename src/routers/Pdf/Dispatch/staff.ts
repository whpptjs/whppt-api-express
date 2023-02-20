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
                  text: `${staffContactInfo.firstName || ''} ${
                    staffContactInfo.lastName || ''
                  }`,
                  style: 'shippingAddress',
                  margin: [50, 0, 0, 0],
                },
              ],
              [
                {
                  text: `${staffContactInfo.email || ''}`,
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
