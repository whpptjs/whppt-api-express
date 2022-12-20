import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import * as validations from './Validations';

export type ChangeOrderShippingArgs = {
  orderId: string;
  shipping: {
    pickup?: boolean;
    contactDetails?: {
      firstName?: string;
      lastName?: string;
      company?: string;
    };
    address: {
      number: string;
      street: string;
      suburb: string;
      city: string;
      state: string;
      country: string;
      postCode: string;
    };
  };
};

const changeOrderShippingDetails: HttpModule<ChangeOrderShippingArgs, Order> = {
  exec(context, { orderId, shipping }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    if (!shipping.pickup) {
      assert(shipping.address, 'Address is required.');
      assert(shipping.address.number, 'Address number is required.');
      assert(shipping.address.street, 'Address street is required.');
      assert(shipping.address.suburb, 'Address suburb is required.');
      assert(shipping.address.city, 'Address city is required.');
      assert(shipping.address.state, 'Address state is required.');
      assert(shipping.address.country, 'Address country is required.');
      assert(shipping.address.postCode, 'Address postCode is required.');
    }

    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Order>('orders', { filter: { _id: orderId } })
        .then(loadedOrder => {
          console.log(
            '🚀 ~ file: changeOrderShippingDetails.ts:70 ~ return$database.then ~ loadedOrder',
            loadedOrder
          );

          assert(loadedOrder, 'Order not found.');
          validations.canBeModified(loadedOrder);

          const event = createEvent('OrderShippingDetailsUpdated', {
            _id: loadedOrder._id,
            shipping,
          });

          assign(loadedOrder, {
            ...loadedOrder,
            shipping: {
              ...loadedOrder.shipping,
              contactDetails: shipping.contactDetails,
              address: shipping.address,
              pickup: !!shipping.pickup,
            },
          });

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, [event], { session });
          }).then(() => loadedOrder);
        });
    });
  },
};

export default changeOrderShippingDetails;
