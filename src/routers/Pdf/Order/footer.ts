export const footer = (payment: any) => {
  const memberShippingDiscount = payment.memberShippingDiscount / 100 || 0;
  const memberTotalDiscount = payment.memberTotalDiscount / 100 || 0;
  const shipping = payment.shippingCost?.price / 100;
  const subtotal = payment.subTotal / 100;
  const tax = payment.subTotal / 11 / 100;
  const total = payment.amount / 100;

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
            text: 'SUBTOTAL (incl. GST)',
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
        text: `($${memberTotalDiscount.toFixed(2)})`,
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
      text: `${shipping ? `$${shipping.toFixed(2)}` : 'Free'}`,
      bold: false,
      font: 'SweetSansPro',
      alignment: 'right',
      fontSize: 10,
    },
  ]);

  if (memberShippingDiscount) {
    table.table.body.push([
      {
        text: 'SHIPPING DISCOUNT',
        bold: true,
        font: 'SweetSansPro',
        alignment: 'left',
        fontSize: 10,
      },
      {
        text: `($${memberShippingDiscount.toFixed(2)})`,
        bold: false,
        font: 'SweetSansPro',
        alignment: 'right',
        fontSize: 10,
      },
    ]);
  }
  table.table.body.push([
    {
      text: 'TAX (incl.)',
      bold: true,
      font: 'SweetSansPro',
      alignment: 'left',
      fontSize: 10,
    },
    {
      text: `$${tax.toFixed(2)}`,
      bold: false,
      font: 'SweetSansPro',
      alignment: 'right',
      fontSize: 10,
    },
  ]);

  table.table.body.push([
    {
      text: 'TOTAL',
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
