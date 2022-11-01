import { ContextType } from 'src/context/Context';
import { loadOrderWithProducts } from '../../../routers/Stripe/Helpers/loadOrderWithProducts';

export type CalculateTotalArgs = (
  context: ContextType,
  orderId: string
) => Promise<{ total: number }>;

export const calculateTotal: CalculateTotalArgs = (ctx, orderId) => {
  return loadOrderWithProducts(ctx, orderId).then(order => {
    const itemsCostInDollars =
      order && order.items.length
        ? order.items.reduce(
            (acc: number, item) =>
              acc + Number(item.product?.price) * Number(item.quantity),
            0
          )
        : 0;
    const itemsCostInCents = itemsCostInDollars * 1000;
    const postageCost = order?.shipping?.shippingCost || 0;
    const postageCostInCents = postageCost * 1000;

    const total = itemsCostInCents + postageCostInCents;
    return { total };
  });
};
