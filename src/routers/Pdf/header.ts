import * as path from 'path';
import { format } from 'date-fns';

const rootDirectory = path.resolve(__dirname, '../../');

const header = (orderId: string, updatedAt: string) => [
  {
    layout: 'noBorders',
    table: {
      alignment: 'center',
      heights: [100],
      widths: ['*'],
      verticalAlignment: 'middle',
      body: [
        [
          {
            alignment: 'center',
            verticalAlignment: 'middle',
            fillColor: '#D4CAB7',
            color: [36, 36, 36],
            margin: [50, 20, 50, 10],
            layout: 'noBorders',
            table: {
              verticalAlignment: 'middle',
              widths: ['*', '*'],
              body: [
                [
                  {
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    fillColor: '#D4CAB7',
                    color: [36, 36, 36],
                    layout: 'noBorders',
                    table: {
                      verticalAlignment: 'middle',
                      widths: ['*'],
                      body: [
                        [
                          {
                            image: path.join(rootDirectory, 'images', 'logo', 'logo.png'),
                            width: 90,
                            height: 34,
                            alignment: 'left',
                          },
                        ],
                        [
                          {
                            text: `Order ID: ${orderId}`,
                            fontSize: 12,
                            font: 'Roxborough',
                            alignment: 'left',
                            verticalAlignment: 'bottom',
                          },
                        ],
                        [
                          {
                            text: `Order date: ${format(
                              new Date(updatedAt),
                              'dd LLL y'
                            )}`,
                            fontSize: 12,
                            font: 'Roxborough',
                            verticalAlignment: 'middle',
                            alignment: 'left',
                          },
                        ],
                      ],
                    },
                  },
                  {
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    fillColor: '#D4CAB7',
                    color: [36, 36, 36],
                    layout: 'noBorders',
                    margin: [0, 20, 0, 0],
                    table: {
                      verticalAlignment: 'middle',
                      widths: ['*'],
                      body: [
                        [
                          {
                            text: `Gerald Roberts Rd, Jenke Road, Seppeltsfield, SA 5355`,
                            font: 'Roxborough',
                            fontSize: 8,
                            alignment: 'right',
                            verticalAlignment: 'bottom',
                          },
                        ],
                        [
                          {
                            text: '08 8562 8427 - 08 8333 0246 (fax)',
                            fontSize: 8,
                            font: 'Roxborough',
                            alignment: 'right',
                            verticalAlignment: 'bottom',
                          },
                        ],
                        [
                          {
                            text: 'ABN (33 097 614 661)',
                            fontSize: 8,
                            font: 'Roxborough',
                            alignment: 'right',
                            verticalAlignment: 'bottom',
                          },
                        ],
                        [
                          {
                            text: 'Liquor Production and Sales Licence: 57605063',
                            fontSize: 8,
                            font: 'Roxborough',
                            alignment: 'right',
                            verticalAlignment: 'bottom',
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],
            },
          },
        ],
      ],
    },
  },
];

export default header;
