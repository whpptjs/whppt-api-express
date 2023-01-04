import { ContextType } from 'src/context/Context';
import { MembershipTier } from 'src/modules/membershipTier/Models/MembershipTier';
import { OrderItemWithProduct, ShippingCost } from '../Models/Order';
import { getShippingCost } from './getShippingCost';
import { loadOrderWithProducts } from './loadOrderWithProducts';
import { queryMemberTier } from './queryMemberTier';

export type CalculateTotalArgs = (
  context: ContextType,
  args: { orderId: string; domainId: string; memberId?: string }
) => Promise<{
  total: number;
  tax: number;
  subTotal: number;
  memberTotalDiscount: number;
  memberShippingDiscount: number;
  shippingCost: ShippingCost;
}>;

export const GST = 0.1;

export const calculateTotal: CalculateTotalArgs = (
  ctx,
  { orderId, domainId, memberId }
) => {
  return loadOrderWithProducts(ctx, { _id: orderId }).then(order => {
    return Promise.all([
      getShippingCost(ctx, {
        postcode: order.shipping?.address?.postCode,
        pickup: order.shipping?.pickup || false,
        domainId,
      }),
      queryMemberTier(ctx, { domainId, memberId }),
    ]).then(([shippingCost, memberTier]) => {
      const itemsCostInCents =
        order && order.items.length
          ? order.items.reduce(
              (acc: number, item: OrderItemWithProduct) =>
                acc + Number(item.product?.price) * Number(item.quantity),
              0
            )
          : 0;

      const postageCostInCents =
        order?.shipping?.shippingCost?.price || shippingCost?.price || 0;

      if (!shippingCost.allowCheckout) throw new Error(shippingCost.message);

      const memberTotalDiscount = memberTier?.discounts
        ? membersTotalSavings(memberTier, itemsCostInCents)
        : 0;

      const memberShippingDiscount = memberTier?.discounts
        ? membersShippingSaving(memberTier, Number(shippingCost.price))
        : 0;

      const gst = (itemsCostInCents - memberTotalDiscount) * GST;

      const total =
        Number(itemsCostInCents) +
        Number(postageCostInCents) +
        gst -
        memberTotalDiscount -
        memberShippingDiscount;

      return {
        total,
        tax: gst,
        subTotal: itemsCostInCents,
        shippingCost: order?.shipping?.shippingCost || shippingCost,
        memberTotalDiscount,
        memberShippingDiscount,
      };
    });
  });
};

const membersTotalSavings = (tier: MembershipTier, subTotal: number) => {
  const savings = tier?.discounts?.reduce((partialSum, discount) => {
    if (discount.appliedTo === 'shipping') return partialSum + 0;
    if (discount.type === 'flat') return partialSum + discount.value;
    return partialSum + subTotal * (discount.value / 100);
  }, 0);
  return savings || 0;
};

const membersShippingSaving = (tier: MembershipTier, shippingCost: number) => {
  if (!tier?.discounts) return 0;

  const _cost = tier?.discounts?.reduce((partialSum, discount) => {
    if (discount.appliedTo === 'total') return partialSum + 0;
    if (discount.type === 'flat') return partialSum + discount.value;

    return partialSum + shippingCost * (discount.value / 100);
  }, 0);
  return _cost || 0;
};
