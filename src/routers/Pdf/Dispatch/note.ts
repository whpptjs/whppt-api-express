export const note = (note: string) => {
  return note
    ? [
        {
          layout: 'noBorders',
          table: {
            alignment: 'left',
            widths: ['*'],
            body: [
              [
                {
                  text: 'Order notes:',
                  bold: true,
                  font: 'SweetSansPro',
                  style: 'shippingAddress',
                  margin: [50, 0, 0, 0],
                },
              ],
              [
                {
                  text: note,
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
