import { capitalizeFirstLetter } from '../capitalize';

export const subheader = (shipping: any, contact: any) => {
  const shippingDetails = [
    {
      layout: 'noBorders',
      table: {
        alignment: 'left',
        widths: ['*'],
        body: [
          [
            {
              text: 'Shipping Address:',
              bold: true,
              font: 'SweetSansPro',
              style: 'shippingAddress',
              margin: [50, 30, 0, 0],
            },
          ],
          [
            {
              text: `${contact?.email} `,
              style: 'shippingAddress',
              margin: [50, 0, 0, 0],
            },
          ],
          [
            {
              text: `${contact?.phoneNumber} `,
              style: 'shippingAddress',
              margin: [50, 0, 0, 0],
            },
          ],
          [
            {
              text: `${
                shipping.contact?.firstName
                  ? capitalizeFirstLetter(shipping.contact.firstName)
                  : ''
              } ${
                shipping.contact?.lastName
                  ? capitalizeFirstLetter(shipping.contact.lastName)
                  : ''
              }`,
              style: 'shippingAddress',
              margin: [50, 0, 0, 0],
            },
          ],
          [
            {
              text: `${shipping.street}`,
              style: 'shippingAddress',
              margin: [50, 0, 0, 0],
            },
          ],
          [
            {
              text: `${shipping.state}`,
              style: 'shippingAddress',
              margin: [50, 0, 0, 0],
            },
          ],
          [
            {
              text: `${shipping.country}`,
              style: 'shippingAddress',
              margin: [50, 0, 0, 10],
            },
          ],
        ],
      },
    },
  ];

  if (!!shipping.contact.company) {
    shippingDetails.push({
      layout: 'noBorders',
      table: {
        alignment: 'left',
        widths: ['*'],
        body: [
          [
            {
              text: 'Company name:',
              bold: true,
              font: 'SweetSansPro',
              style: 'shippingAddress',
              margin: [50, 10, 0, 0],
            },
          ],
          [
            {
              text: `${shipping.contact.company}`,
              style: 'shippingAddress',
              margin: [50, 0, 0, 10],
            },
          ],
        ],
      },
    });
  }

  return shippingDetails;
};
