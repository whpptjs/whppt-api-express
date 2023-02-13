const buildOrderTable = (products: any) => {
  const rows: any[] = [];

  products.forEach((item: any) => {
    rows.push({
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 100, '*'],
        body: [
          ['Name', 'Vintage', 'Quantity'],
          [
            item.name || 'unavailable',
            item.vintage || 'unavailable',
            item.quantity || 'unavailable',
          ],
        ],
      },
    });
  });

  return rows;
};

export default buildOrderTable;
