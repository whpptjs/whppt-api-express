import { ContextType } from 'src/context/Context';
import { ShippingCost } from '../Models/Order';
import { getShippingCost } from './getShippingCost';
import { loadOrderWithProducts } from './loadOrderWithProducts';
import { queryMemberTier } from './queryMemberTier';
import { calculateOrderCosts } from './helpers/calculateOrderCosts';

export type CalculateTotalArgs = (
  context: ContextType,
  args: {
    orderId: string;
    domainId: string;
    memberId?: string;
  }
) => Promise<{
  total: number;
  subTotal: number;
  originalSubTotal?: number;
  memberTotalDiscount: number;
  memberShippingDiscount: number;
  shippingCost: ShippingCost;
  originalTotal: number;
  overrideTotalPrice: number | undefined;
  discountApplied: number | undefined;
}>;

export const calculateTotal: CalculateTotalArgs = (
  ctx,
  { orderId, domainId, memberId }
) => {
  return loadOrderWithProducts(ctx, { _id: orderId }).then(order => {
    return Promise.all([
      getShippingCost(ctx, {
        items: order.items,
        postcode: order.shipping?.address?.postCode,
        country: order.shipping?.address?.country,
        pickup: order.shipping?.pickup || false,
        domainId,
        override: order?.shipping?.shippingCost?.override
          ? order?.shipping?.shippingCost
          : ({} as ShippingCost),
      }),
      queryMemberTier(ctx, { domainId, memberId, orderId }),
    ]).then(([shippingCost, memberTier]) => {
      return calculateOrderCosts([shippingCost, memberTier, order]);
    });
  });
};
