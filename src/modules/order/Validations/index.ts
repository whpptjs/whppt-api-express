import assert from 'assert';
import { Order } from '../Models/Order';

export const canBeModified = (order: Order) =>
  assert(order?.checkoutStatus === 'pending', 'Only pending orders can be modified.');

export const itemExists = (order: Order, orderItemId: string) =>
  assert(
    order.items.filter(i => i._id === orderItemId),
    'Order Item was not found on order.'
  );
