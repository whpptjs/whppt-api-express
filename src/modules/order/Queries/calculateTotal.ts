import { ContextType } from 'src/context/Context';
import { OrderItemWithProduct } from '../Models/Order';
import { loadOrderWithProducts } from './loadOrderWithProducts';

export type CalculateTotalArgs = (
  context: ContextType,
  orderId: string
) => Promise<number>;

export const calculateTotal: CalculateTotalArgs = (ctx, orderId) => {
  return loadOrderWithProducts(ctx, { _id: orderId }).then(order => {
    const itemsCostInCents =
      order && order.items.length
        ? order.items.reduce(
            (acc: number, item: OrderItemWithProduct) =>
              acc + Number(item.product?.price) * Number(item.quantity),
            0
          )
        : 0;
    const postageCostInCents = order?.shipping?.shippingCost || 0;

    const total = itemsCostInCents + postageCostInCents;
    return total;
  });
};
