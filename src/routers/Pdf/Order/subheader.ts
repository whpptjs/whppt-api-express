import { sanitizeAddressString } from '../Dispatch/composeOrderData';
import { format } from 'date-fns';

const subheader = (order: any, contact: any, memberTier: any) => {
  const userData = memberTier
    ? {
        text: 'MEMBER',
        fontSize: 12,
        color: [147, 122, 74],
        font: 'SweetSansPro',
        alignment: 'right',
        verticalAlignment: 'bottom',
      }
    : {
        text: 'CONTACT',
        fontSize: 12,
        color: [147, 122, 74],
        font: 'SweetSansPro',
        alignment: 'right',
        verticalAlignment: 'bottom',
      };

  return [
    {
      layout: 'noBorders',
      table: {
        alignment: 'center',
        widths: ['*'],
        verticalAlignment: 'middle',
        body: [
          [
            {
              alignment: 'center',
              verticalAlignment: 'middle',
              fillColor: 'white',
              color: [36, 36, 36],
              margin: [50, 10, 50, 0],
              layout: 'noBorders',
              table: {
                verticalAlignment: 'middle',
                widths: ['*', '*'],
                body: [
                  [
                    {
                      text: 'DATE',
                      fontSize: 12,
                      color: [147, 122, 74],
                      font: 'SweetSansPro',
                      alignment: 'left',
                      verticalAlignment: 'bottom',
                    },
                    {
                      text: 'SUBTOTAL',
                      fontSize: 12,
                      color: [147, 122, 74],
                      font: 'SweetSansPro',
                      alignment: 'right',
                      verticalAlignment: 'bottom',
                    },
                  ],
                  [
                    {
                      text: `${format(new Date(order.payment.date), 'dd LLL y')}`,
                      fontSize: 10,
                      font: 'SweetSansPro',
                      alignment: 'left',
                      verticalAlignment: 'bottom',
                    },
                    {
                      text: `$${(order.payment.subTotal / 100).toFixed(2)}`,
                      fontSize: 10,
                      font: 'SweetSansPro',
                      alignment: 'right',
                      verticalAlignment: 'bottom',
                    },
                  ],
                  [
                    {
                      text: 'SHIPPING',
                      fontSize: 12,
                      color: [147, 122, 74],
                      font: 'SweetSansPro',
                      alignment: 'left',
                      verticalAlignment: 'bottom',
                    },
                    userData,
                  ],
                  [
                    {
                      text: ` ${
                        order?.shipping?.address?.number || ''
                      } ${sanitizeAddressString(
                        order?.shipping?.address?.street
                      )}  ${sanitizeAddressString(
                        order?.shipping?.address?.suburb
                      )} ${sanitizeAddressString(
                        order?.shipping?.address?.city
                      )} ${sanitizeAddressString(
                        order?.shipping?.address?.state
                      )} ${sanitizeAddressString(order?.shipping?.address?.country)} `,
                      fontSize: 10,
                      font: 'SweetSansPro',
                      verticalAlignment: 'middle',
                      alignment: 'left',
                    },
                    {
                      text: `${memberTier ? `${memberTier.name}` : ''}
                      ${contact?.firstName} ${contact?.lastName}
                      ${contact?.email}
                    `,
                      fontSize: 10,
                      alignment: 'right',
                      font: 'SweetSansPro',
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
};

export default subheader;
