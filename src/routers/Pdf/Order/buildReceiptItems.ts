const buildReceiptItems = (items: any) => {
  const receiptItems: any = [
    {
      layout: {
        hLineColor: [147, 122, 74],
        vLineColor: [147, 122, 74],
      },
      margin: [50, 5, 50, 0],

      table: {
        headerRows: 1,
        widths: ['*', '15%', '15%'],
        border: [1, 1, 1, 1],
        alignment: 'center',
        verticalAlignment: 'center',
        height: 'auto',
        body: [
          [
            {
              text: `Product Name`,
              styles: 'tableCell',
              alignment: 'left',
              font: 'SweetSansPro',
              verticalAlignment: 'middle',
              bold: true,
            },
            {
              text: `Quantity`,
              styles: 'tableCell',
              alignment: 'left',
              font: 'SweetSansPro',
              verticalAlignment: 'middle',
              bold: true,
            },
            {
              text: `Price`,
              styles: 'tableCell',
              alignment: 'left',
              font: 'SweetSansPro',
              verticalAlignment: 'middle',
              bold: true,
            },
          ],
        ],
      },
    },
  ];

  items.forEach((item: any, index: any) => {
    receiptItems.push({
      layout: {
        hLineColor: [147, 122, 74],
        vLineColor: [147, 122, 74],
      },
      table: {
        headerRows: 1,
        widths: ['*', '15%', '15%'],
        border: [1, 1, 1, 1],
        alignment: 'center',
        verticalAlignment: 'center',
        height: 'auto',
        body: [
          [
            {
              layout: 'noBorders',
              table: {
                headerRows: 1,
                widths: ['*', '*'],
                alignment: 'center',
                body: [
                  [
                    {
                      text: `${item.product.name}`,
                      styles: 'tableCell',
                      alignment: 'left',
                      font: 'SweetSansPro',
                      colSpan: 2,
                    },
                    '',
                  ],
                  [
                    {
                      text: `${item.product.customFields.vintage}`,
                      styles: 'tableCell',
                      alignment: 'left',
                      font: 'SweetSansPro',
                    },
                    '',
                  ],
                ],
              },
            },
            {
              text: `${item.quantity}`,
              styles: 'tableCell',
              alignment: 'center',
              font: 'SweetSansPro',
              verticalAlignment: 'middle',
            },
            {
              text: `$${(item.purchasedPrice / 100).toFixed(2)}`,
              styles: 'tableCell',
              alignment: 'left',
              font: 'SweetSansPro',
              verticalAlignment: 'middle',
            },
          ],
        ],
      },
      margin: [50, 0, 50, index === items.length - 1 ? 150 : 5],
    });
  });

  return receiptItems;
};

export default buildReceiptItems;
