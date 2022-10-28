import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import findContactOrCreate from '../contact/findContactOrCreate';

export type ChangeOrderInfoArgs = {
  orderId: string;
  contactId?: string;
  contactRecord: {
    email: string;
  };
};

const continueToPayment: HttpModule<ChangeOrderInfoArgs, Order> = {
  exec(context, { orderId, contactRecord, contactId }) {
    const { $database, createEvent } = context;
    assert(orderId, 'Order Id is required.');
    assert(contactRecord.email, 'email is required.');

    return $database.then(({ document, startTransaction }) => {
      return Promise.all([
        document.query<Order>('orders', { filter: { _id: orderId } }),
        findContactOrCreate.exec(context, { email: contactRecord.email, contactId }),
      ]).then(([loadedOrder, contact]) => {
        assert(loadedOrder, 'Order not found.');
        assert(loadedOrder.orderStatus, 'Order already completed.');

        if (
          loadedOrder.contactRecord?.email === contactRecord.email &&
          contact._id === loadedOrder.contactId
        )
          return loadedOrder;

        const event = createEvent('OrderInformationUpdated', {
          _id: loadedOrder._id,
          contactRecord,
          contactId: contact._id,
        });

        assign(loadedOrder, {
          ...loadedOrder,
          contactId: contact._id,
          contactRecord: {
            ...loadedOrder.contactRecord,
            ...contactRecord,
          },
        });

        return startTransaction(session => {
          return document.saveWithEvents('orders', loadedOrder, [event], { session });
        }).then(() => loadedOrder);
      });
    });
  },
};

export default continueToPayment;
