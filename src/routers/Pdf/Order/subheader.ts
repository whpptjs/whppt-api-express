import { sanitizeAddressString, sanitizeUnitString } from '../Dispatch/composeOrderData';
// import { format } from 'date-fns';

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
                      text: `${contact?.firstName} ${contact?.lastName}
                      ${order?.shipping?.contactDetails?.company || ''}
                      ${sanitizeUnitString(order?.shipping?.address?.unit)} ${
                        order?.shipping?.address?.number || ''
                      } ${sanitizeAddressString(
                        order?.shipping?.address?.street
                      )}  ${sanitizeAddressString(
                        order?.shipping?.address?.suburb
                      )} ${sanitizeAddressString(
                        order?.shipping?.address?.state
                      )} ${sanitizeAddressString(order?.shipping?.address?.country)} 
                      ${sanitizeAddressString(order?.shipping?.address?.postCode)} `,
                      fontSize: 10,
                      font: 'SweetSansPro',
                      verticalAlignment: 'middle',
                      alignment: 'left',
                    },
                    {
                      text: `${memberTier ? `${memberTier.name}` : ''}
                      ${contact?.firstName} ${contact?.lastName}
                      ${contact?.email || ''}
                      ${contact?.company} `,
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
