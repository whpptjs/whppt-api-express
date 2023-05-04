export const footer = (payment: any) => {
  const memberShippingDiscount = payment.memberShippingDiscount / 100 || 0;
  const memberTotalDiscount = payment.memberTotalDiscount / 100 || 0;
  const shipping = payment.shippingCost?.price / 100;
  const shippingCostWithDiscount = shipping - memberShippingDiscount;
  const subtotal = payment.subTotal / 100;
  const subTotalAfterShippingAndDiscounts =
    subtotal + shipping - memberShippingDiscount - memberTotalDiscount;
  const tax = subTotalAfterShippingAndDiscounts / 11;
  const total = subTotalAfterShippingAndDiscounts;

  const table = {
    layout: {
      hLineWidth: function (i: any, node: any) {
        return i === node.table.body.length - 1 ? 1 : 0;
      },
      hLineColor: () => 0,
      vLineWidth: () => 0,
      padding: [0, 50],
    },
    table: {
      widths: ['*', '*'],
      body: [
        [
          {
            text: 'SUBTOTAL',
            bold: true,
            font: 'SweetSansPro',
            fontSize: 10,
            alignment: 'left',
          },
          {
            text: `$${subtotal.toFixed(2)}`,
            bold: false,
            font: 'SweetSansPro',
            alignment: 'right',
            fontSize: 10,
          },
        ],
      ],
    },
    margin: [50, 5, 50, 5],
  };

  if (memberTotalDiscount) {
    table.table.body.push([
      {
        text: 'MEMBER DISCOUNT',
        bold: true,
        font: 'SweetSansPro',
        alignment: 'left',
        fontSize: 10,
      },
      {
        text: `(-$${memberTotalDiscount.toFixed(2)})`,
        bold: false,
        font: 'SweetSansPro',
        alignment: 'right',
        fontSize: 10,
      },
    ]);
  }

  table.table.body.push([
    {
      text: 'SHIPPING',
      bold: true,
      font: 'SweetSansPro',
      alignment: 'left',
      fontSize: 10,
    },
    {
      text: `${
        shippingCostWithDiscount > 0
          ? `$${shippingCostWithDiscount.toFixed(2)}`
          : 'Complimentary'
      }`,
      bold: false,
      font: 'SweetSansPro',
      alignment: 'right',
      fontSize: 10,
    },
  ]);

  table.table.body.push([
    {
      text: `TOTAL (incl. $${tax.toFixed(2)} GST)`,
      bold: true,
      font: 'SweetSansPro',
      alignment: 'left',
      fontSize: 12,
    },
    {
      text: `$${total.toFixed(2)}`,
      bold: false,
      font: 'SweetSansPro',
      alignment: 'right',
      fontSize: 12,
    },
  ]);

  return table;
};
