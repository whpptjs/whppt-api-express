import { Order } from 'src/modules/order/Models/Order';
import fetch from 'node-fetch';
import assert from 'assert';
import { ContextType } from 'src/context/Context';
export type AusPostService = (context: ContextType) => Promise<{
  createShipment: (args: {
    order: Order;
    shippingDetails: {
      firstName?: string;
      lastName?: string;
      number?: string;
      company?: string;
      street?: string;
      suburb?: string;
      postCode?: string;
      state?: string;
      country?: string;
    };
    length: number;
    width: number;
    height: number;
    weight: number;
  }) => Promise<string>;
  // createLabel: (shipment_id: string) => Promise<string>;
  getLabel: (labelRequestId: string) => Promise<{ url: string; labelStatus: string }>;
}>;

export const AusPost: AusPostService = ({ $hosting }) => {
  return $hosting.then(({ ausPost }) => {
    const AUS_POST_BASE_URL = ausPost.base_url;
    const headers = {
      'Content-Type': 'application/json',
      'account-number': ausPost.account_number,
      Authorization: ausPost.authorization,
      Cookie: ausPost.cookie,
    };

    return {
      createShipment: ({ order, shippingDetails, length, width, height, weight }) => {
        const { firstName, lastName, company } =
          shippingDetails || order?.shipping?.contactDetails || {};

        const { number, street, suburb, state, country, postCode } =
          shippingDetails || order?.shipping?.address || {};

        assert(firstName || lastName, 'Aus Post requres a Name.');
        assert(street, 'Aus Post requres a Street.');
        assert(suburb, 'Aus Post requres a Suburb.');
        assert(state, 'Aus Post requres a State.');
        assert(postCode, 'Aus Post requres a Post Code.');

        const _body = {
          shipments: [
            {
              sender_references: [order.orderNumber, order._id],
              addresses: {
                from: {
                  name: 'Hentley Farm',
                  lines: ['Cnr Gerald Roberts and Jenke Rds'],
                  suburb: 'Seppeltsfield',
                  postcode: '5355',
                  state: 'SA',
                  phone: '0883330241',
                },
                to: {
                  name: [firstName, lastName, company ? company : ''].join(' '),
                  company,
                  lines: [`${number} ${street}`],
                  suburb,
                  state,
                  country,
                  postcode: postCode,
                  email: order?.contact?.email,
                },
              },
              service: {
                speed: 'STANDARD',
                features: [
                  {
                    type: 'SIGNATURE_ON_DELIVERY',
                    attributes: {
                      delivery_option: 'CARD_IF_NOT_HOME',
                    },
                  },
                ],
              },
              shipment_contents: {
                type: 'NEUTRAL',
              },
              articles: [
                {
                  packaging_type: 'CTN',
                  length,
                  height,
                  width,
                  weight,
                },
              ],
            },
          ],
        };
        return fetch(`${AUS_POST_BASE_URL}/shipping/v1/shipments`, {
          method: 'post',
          body: JSON.stringify(_body),
          headers,
        })
          .then((response: any) => response.json())
          .then((data: any) => {
            if (data.errors?.length) throw new Error(data.errors[0].message);
            if (!data?.shipments?.length)
              throw new Error('Something went wrong getting creating shipment');

            const shipment_id = data?.shipments[0]?.shipment_id as string;
            if (!shipment_id)
              throw new Error('Something went wrong creating shipment_id');
            return shipment_id;
          })
          .catch((err: any) => {
            throw err;
          });
      },
      getLabel(labelRequestId) {
        return fetch(`${AUS_POST_BASE_URL}/shipping/v1/labels/${labelRequestId}`, {
          method: 'get',
          headers,
        })
          .then((a: any) => {
            return a.json().then((data: any) => {
              if (data?.errors?.length) throw new Error(data.errors[0].message);
              if (!data?.labels?.length)
                throw new Error('Something went wrong getting url label');

              const label = data?.labels[0];
              if (!label) throw new Error('Something went wrong getting label');

              return { url: label.url, labelStatus: label.status };
            });
          })
          .catch((err: any) => {
            throw err;
          });
      },
    };
  });
};

// {
//     "shipments": [
//             {
//               "shipment_reference": "Sample Order from Website",
//               "customer_reference_1": "CustId",
//                 "from": {
//                   "name": 'Hentley Farm',
//                   "lines": ['Cnr Gerald Roberts and Jenke Rds'],
//                   "suburb": 'Seppeltsfield',
//                   "postcode": '5355',
//                   "state": 'SA',
//                   "phone": '0883330241',
//                 },
//                 "to": {
//                   "name": "test buisness",
//                   company: "test Company",
//                   "lines": ['111 Bourke St'],
//                   "suburb": 'Melbourne',
//                   state: 'VIC',
//                   "postcode": "3000",
//                   "email": 'Carl@hotmail.com',
//                 },
//               "items": [
//                 {
//                   "length": 10,
//                   "height": 10,
//                   "width": 10,
//                   "weight":10,
//                   "item_reference": "blocked",
//                   "product_id": 'Product3000',
//                   "authority_to_leave": false,
//                   "safe_drop_enabled": false,
//                   "allow_partial_delivery": false,
//               }
//             ]
//             },
//     ]
// }
