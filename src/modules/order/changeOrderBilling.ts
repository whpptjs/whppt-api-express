import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

export type ChangeOrderBillingArgs = {
  orderId: string;
  billing: {
    contactDetails: {
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

const changeOrderBilling: HttpModule<ChangeOrderBillingArgs, void> = {
  exec(context, { orderId, billing }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    assert(billing.address, 'Address is required.');
    assert(billing.address.number, 'Address number is required.');
    assert(billing.address.street, 'Address street is required.');
    assert(billing.address.suburb, 'Address suburb is required.');
    assert(billing.address.city, 'Address city is required.');
    assert(billing.address.state, 'Address state is required.');
    assert(billing.address.country, 'Address country is required.');
    assert(billing.address.postCode, 'Address postCode is required.');

    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Order>('orders', { filter: { _id: orderId } })
        .then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          assert(loadedOrder.checkoutStatus === 'completed', 'Order already completed.');

          const event = createEvent('OrderBillingDetailsUpdated', {
            _id: loadedOrder._id,
            billing,
          });

          assign(loadedOrder, { billing });

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, [event], { session });
          });
        });
    });
  },
};

export default changeOrderBilling;
