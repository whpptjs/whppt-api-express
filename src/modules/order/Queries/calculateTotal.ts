import { ContextType } from 'src/context/Context';
import { OrderItemWithProduct, ShippingCost } from '../Models/Order';
import { getShippingCost } from './getShippingCost';
import { loadOrderWithProducts } from './loadOrderWithProducts';

export type CalculateTotalArgs = (
  context: ContextType,
  args: { orderId: string; domainId: string }
) => Promise<{
  total: number;
  shippingCost: ShippingCost;
}>;

export const calculateTotal: CalculateTotalArgs = (ctx, { orderId, domainId }) => {
  return loadOrderWithProducts(ctx, { _id: orderId }).then(order => {
    return getShippingCost(ctx, {
      postcode: order.shipping?.address?.postCode,
      pickup: order.shipping?.pickup || false,
      domainId,
    }).then(shippingCost => {
      const itemsCostInCents =
        order && order.items.length
          ? order.items.reduce(
              (acc: number, item: OrderItemWithProduct) =>
                acc + Number(item.product?.price) * Number(item.quantity),
              0
            )
          : 0;
      const postageCostInCents = order?.shipping?.shippingCost?.price || 0;

      if (!shippingCost.allowCheckout) throw new Error(shippingCost.message);
      const total =
        Number(itemsCostInCents) +
        Number(postageCostInCents) +
        Number(shippingCost.price);
      return { total, shippingCost };
    });
  });
};
