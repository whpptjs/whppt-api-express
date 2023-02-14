import { OrderWithProductInfo } from '.';
import header from './header';
import { note } from './note';
import { staff } from './staff';
import { subheader } from './subheader';

const buildOrderTable = (orders: OrderWithProductInfo[]) => {
  const tables: any = [];
  const len = orders.length;

  orders.forEach((order: any, index: number) => {
    const table = {
      layout: {
        hLineColor: [147, 122, 74],
        vLineColor: [147, 122, 74],
      },
      table: {
        headerRows: 1,
        widths: ['10%', '*', '*', '*'],
        border: [1, 1, 1, 1],
        alignment: 'center',
        body: [
          [
            {
              text: '#',
              styles: 'tableHeader',
              alignment: 'center',
              font: 'SweetSansPro',
            },
            {
              text: 'Item',
              style: 'tableHeader',
            },
            {
              text: 'Vintage',
              style: 'tableHeader',
            },
            {
              text: 'Quantity',
              style: 'tableHeader',
            },
          ],
        ],
        header: {
          headerBackgroundColor: [147, 122, 74],
        },
      },
      margin: [50, 30, 50, 30],
    };

    order.items.map((item: any, index: number) => {
      table.table.body.push([
        {
          text: String(index),
          font: 'SweetSansPro',
          style: 'tableCell',
        } as any,
        {
          text: item.product?.name || 'unavailable',
          style: 'tableCell',
        } as any,
        {
          text: item.product?.customFields?.vintage || 'unavailable',
          style: 'tableCell',
        } as any,
        {
          text: item.quantity || 'unavailable',
          style: 'tableCell',
        } as any,
      ]);
    });

    tables.push([
      ...header(order.orderId, order.updatedAt),
      ...subheader(order.shipping),
      table,
      ...note(order.note),
      ...staff(order.staffContactInfo),
      { text: '', pageBreak: `${index >= len - 1 ? '' : 'after'}` },
    ]);
  });

  return tables;
};

export default buildOrderTable;
