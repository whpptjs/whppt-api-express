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
  createLabel: (shipment_id: string) => Promise<string>;
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
              sender_references: [order._id],
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
                lines: [`${number} ${street}`],
                suburb,
                state,
                country,
                postcode: postCode,
                email: order?.contact?.email,
                // phone: '0356567567',
                // delivery_instructions: 'please leave at door',
              },
              items: [
                {
                  length,
                  height,
                  width,
                  weight,
                  packaging_type: 'CTN',
                  product_id: 'EXP',
                  authority_to_leave: false,
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
            console.log('🚀 ~ file: index.ts:109 ~ err', err);
            throw err;
          });
      },
      createLabel: shipment_id => {
        const _body = {
          preferences: [
            {
              type: 'PRINT',
              groups: [
                {
                  group: 'Parcel Post',
                  layout: 'THERMAL-LABEL-A6-1PP',
                  branded: true,
                  left_offset: 0,
                  top_offset: 0,
                },
                {
                  group: 'Express Post',
                  layout: 'THERMAL-LABEL-A6-1PP',
                  branded: true,
                  left_offset: 0,
                  top_offset: 0,
                },
              ],
            },
          ],
          shipments: [
            {
              shipment_id,
            },
          ],
        };
        return fetch(`${AUS_POST_BASE_URL}/shipping/v1/labels`, {
          method: 'post',
          body: JSON.stringify(_body),
          headers,
        })
          .then((response: any) => {
            return response.json().then((data: any) => {
              if (data?.errors?.length) throw new Error(data.errors[0].message);
              if (!data?.labels?.length)
                throw new Error('Something went wrong getting creating label');

              const label_request_id = data?.labels[0].request_id;
              if (!label_request_id)
                throw new Error('Something went wrong getting creating label');

              return label_request_id as string;
            });
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
