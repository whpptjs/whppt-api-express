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
            margin: [50, 20, 50, 0],
            layout: 'noBorders',
            table: {
              verticalAlignment: 'middle',
              widths: ['*', '*'],
              body: [
                [
                  {
                    text: `Order ID: ${orderId}`,
                    fontSize: 20,
                    font: 'Roxborough',
                    alignment: 'left',
                    verticalAlignment: 'bottom',
                  },
                  {
                    image: path.join(rootDirectory, 'images', 'logo', 'logo.png'),
                    width: 79,
                    height: 30,
                    alignment: 'right',
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
                    text: '',
                    fontSize: 10,
                    font: 'Roxborough',
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
