import assert from 'assert';
import { assign } from 'lodash';
import { HttpModule } from '../HttpModule';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';

const refund: HttpModule<{ orderId: string; refundReason: string }, void> = {
  exec(context, { orderId, refundReason }) {
    assert(orderId, 'Order Id not found');
    assert(refundReason, 'A Reason not provided');
    return context.$database.then(({ document, startTransaction }) => {
      return document.fetch<Order>('orders', orderId).then(loadedOrder => {
        assert(loadedOrder, 'Order not found');
        assert(loadedOrder?.payment?.status === 'paid', 'Order not in a paid status');
        assert(loadedOrder?.checkoutStatus === 'paid', 'Order not in a paid status');
        const amount =
          (loadedOrder?.payment?.subTotal || 0) -
          (loadedOrder?.payment?.memberTotalDiscount || 0);
        assign(loadedOrder, {
          ...loadedOrder,
          checkoutStatus: 'refunded',
          payment: {
            ...loadedOrder.payment,
            status: 'refunded',
            refund: {
              amount,
              reason: refundReason,
              by: {
                username: context.staff.sub.username,
                _id: context.staff.sub._id,
              },
            },
          },
        });

        const events = [
          context.createEvent('OrderPaymentRefunded', {
            _id: orderId,
            refundReason,
          }),
        ];

        return startTransaction(session => {
          return document.saveWithEvents('orders', loadedOrder, events, {
            session,
          });
        });
      });
    });
  },
};

export default Secure(refund);
