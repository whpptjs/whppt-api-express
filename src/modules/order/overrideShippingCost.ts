import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';
import * as validations from './Validations';

export type OverrideShippingCostArgs = {
  orderId: string;
  price: string;
};

const overrideShippingCost: HttpModule<OverrideShippingCostArgs, Order> = {
  exec(context, { orderId, price }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');

    return $database.then(({ document, startTransaction }) => {
      return document
        .query<Order>('orders', { filter: { _id: orderId } })
        .then(loadedOrder => {
          assert(loadedOrder, 'Order not found.');
          validations.canBeModified(loadedOrder);

          const event = createEvent('OrderShippingCostOverridden', {
            _id: loadedOrder._id,
            price,
          });

          assign(loadedOrder, {
            ...loadedOrder,
            shipping: {
              ...loadedOrder.shipping,
              shippingCost: {
                override: true,
                price,
                message: '',
                type: 'overriden',
                allowCheckout: true,
              },
            },
          });

          return startTransaction(session => {
            return document.saveWithEvents('orders', loadedOrder, [event], { session });
          }).then(() => loadedOrder);
        });
    });
  },
};

export default Secure(overrideShippingCost);
