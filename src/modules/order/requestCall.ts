import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';
import * as validations from './Validations';

const requestCall: HttpModule<{ orderId: string; phone: string }, void> = {
  exec({ $database, createEvent }, { orderId, phone }) {
    assert(orderId, 'An Order id is required');
    assert(phone, 'A Phone number is required');

    return $database.then(database => {
      const { document, startTransaction } = database;
      return document.fetch<Order>('orders', orderId).then(order => {
        validations.canBeModified(order);

        const events = [
          createEvent('CustomerRequestedACallForOrder', { orderId, phone }),
        ];

        order.checkoutStatus = 'requestingACall';
        order.requestContactPhone = phone;

        return startTransaction(session => {
          return document.saveWithEvents('orders', order, events, { session });
        });
      });
    });
  },
};

export default requestCall;
