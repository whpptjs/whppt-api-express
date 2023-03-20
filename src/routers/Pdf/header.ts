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
                    image: path.join(rootDirectory, 'images', 'logo', 'logo.png'),
                    width: 79,
                    height: 30,
                    alignment: 'left',
                  },
                  '',
                ],
                [
                  {
                    text: `Order ID: ${orderId}`,
                    fontSize: 20,
                    font: 'Roxborough',
                    alignment: 'left',
                    verticalAlignment: 'bottom',
                  },
                  {
                    text: `Jenke Road, Seppeltsfield, SA 5355`,
                    font: 'Roxborough',
                    fontSize: 10,

                    alignment: 'right',
                    verticalAlignment: 'bottom',
                  },
                ],

                [
                  {
                    text: `Order date: ${format(new Date(updatedAt), 'dd LLL y')}`,
                    fontSize: 10,
                    font: 'Roxborough',
                    verticalAlignment: 'middle',
                    alignment: 'left',
                  },
                  {
                    text: '08 8562 8427 - 08 8333 0246 (fax)',
                    fontSize: 10,
                    font: 'Roxborough',
                    alignment: 'right',
                  },
                ],

                [
                  '',
                  {
                    text: 'ABN (33 097 614 661)',
                    fontSize: 10,
                    font: 'Roxborough',
                    alignment: 'right',
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
