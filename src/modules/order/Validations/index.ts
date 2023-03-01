import assert from 'assert';
import { Order } from '../Models/Order';

export const canBeModified = (order: Order) =>
  assert(
    order?.checkoutStatus === 'pending' || order?.checkoutStatus === 'requestingACall',
    'Only pending orders can be modified.'
  );
export const hasBeenPaid = (order: Order) =>
  assert(
    order?.checkoutStatus === 'paid' && order?.payment?.status === 'paid',
    `Order has not been paid for. ${order._id}`
  );

export const itemExists = (order: Order, orderItemId: string) =>
  assert(
    order.items.filter(i => i._id === orderItemId),
    'Order Item was not found on order.'
  );
