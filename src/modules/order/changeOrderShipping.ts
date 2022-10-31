import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

export type ChangeOrderShippingArgs = {
  orderId: string;
  shipping: {
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
    express: boolean;
    shippingCost: number;
  };
};

const changeOrderShipping: HttpModule<ChangeOrderShippingArgs, Order> = {
  exec(context, { orderId, shipping }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    assert(shipping.address, 'Address is required.');
    assert(shipping.address.number, 'Address number is required.');
    assert(shipping.address.street, 'Address street is required.');
    assert(shipping.address.suburb, 'Address suburb is required.');
    assert(shipping.address.city, 'Address city is required.');
    assert(shipping.address.state, 'Address state is required.');
    assert(shipping.address.country, 'Address country is required.');
    assert(shipping.address.postCode, 'Address postCode is required.');

    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Order>('orders', { filter: { _id: orderId } })
        .then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          assert(loadedOrder.orderStatus, 'Order already completed.');

          const event = createEvent('OrderShippingDetailsUpdated', {
            _id: loadedOrder._id,
            shipping,
          });

          assign(loadedOrder, {
            ...loadedOrder,
            shipping,
          });

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, [event], { session });
          }).then(() => loadedOrder);
        });
    });
  },
};

export default changeOrderShipping;
