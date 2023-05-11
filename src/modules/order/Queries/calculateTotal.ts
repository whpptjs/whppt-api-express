import { ContextType } from 'src/context/Context';
import { Order, OrderItem, OrderItemWithProduct, ShippingCost } from '../Models/Order';
import { getShippingCost } from './getShippingCost';
import { loadOrderWithProducts } from './loadOrderWithProducts';
import { queryMemberTier } from './queryMemberTier';
// import { queryMemberAmountSpentForYear } from './queryMemberAmountSpentForYear';
import { calculateMembersTotalSavings } from './helpers/membersTotalSavings';
import { calculateMemberShippingSavings } from './helpers/membersShippingSavings';

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
        pickup: order.shipping?.pickup || false,
        domainId,
        override: order?.shipping?.shippingCost?.override
          ? order?.shipping?.shippingCost
          : ({} as ShippingCost),
      }),
      queryMemberTier(ctx, { domainId, memberId, orderId }),
      // queryMemberAmountSpentForYear(ctx, { memberId }),
    ]).then(([shippingCost, memberTier]) => {
      // ]).then(([shippingCost, memberTier, { currentYear }]) => {
      const itemsCostInCents =
        order && order.items.length
          ? order.items.reduce((acc: number, item: OrderItemWithProduct) => {
              const price = Number(
                item.overidedPrice || item.overidedPrice === 0
                  ? item.overidedPrice
                  : item.product?.price
              );
              return acc + price * Number(item.quantity);
            }, 0)
          : 0;
      const itemsDiscountedCostInCents =
        order && order.items.length
          ? order.items.reduce((acc: number, item: OrderItemWithProduct) => {
              const price = Number(
                item.overidedPrice || item.overidedPrice === 0
                  ? item.overidedPrice
                  : undefined
              );
              if (!price) return acc;
              return acc + price * Number(item.quantity);
            }, 0)
          : 0;
      const itemsOriginalCostInCents =
        order && order.items.length
          ? order.items.reduce((acc: number, item: OrderItemWithProduct) => {
              const price = Number(item.product?.price);
              return acc + price * Number(item.quantity);
            }, 0)
          : 0;

      const postageCostInCents =
        order?.shipping?.shippingCost?.price || shippingCost?.price || 0;

      if (!shippingCost.allowCheckout) throw new Error(shippingCost.message);

      const amountOfProducts = calcAmountOfProducts(order);

      const overrideTotalPrice =
        order?.overrides?.total || order?.overrides?.total === 0
          ? Number(order?.overrides?.total)
          : undefined;

      const memberTotalDiscount =
        memberTier?.discounts && !overrideTotalPrice && !itemsDiscountedCostInCents
          ? calculateMembersTotalSavings(
              [memberTier, ...(memberTier.nextTiers || [])],
              itemsCostInCents,
              memberTier.amountSpentWithDiscount || 0,
              amountOfProducts,
              memberTier.lockToTier || ''
            ).reduce(
              (acc: number, discount: any) => acc + discount.discountApplied || 0,
              0
            )
          : 0;

      // memberTier?.discounts && !overrideTotalPrice
      const memberShippingDiscount = memberTier?.discounts
        ? calculateMemberShippingSavings(
            memberTier,
            shippingCost,
            itemsCostInCents,
            memberTotalDiscount,
            amountOfProducts,
            memberTier.amountSpentWithDiscount || 0
          )
        : 0;

      const itemsWithDiscount =
        itemsDiscountedCostInCents > 0
          ? Number(itemsCostInCents)
          : Number(itemsCostInCents) - memberTotalDiscount < 0
          ? 0
          : Number(itemsCostInCents) - memberTotalDiscount;

      const postageWithDiscount =
        Number(postageCostInCents) - memberShippingDiscount < 0
          ? 0
          : Number(postageCostInCents) - memberShippingDiscount;

      const total =
        overrideTotalPrice || overrideTotalPrice == 0
          ? overrideTotalPrice
          : itemsWithDiscount + postageWithDiscount;

      const subTotal =
        overrideTotalPrice || overrideTotalPrice == 0
          ? overrideTotalPrice
          : itemsCostInCents;
      const originalTotal = itemsWithDiscount + postageWithDiscount;

      const totalOverrideOfOriginalTotal = overrideTotalPrice
        ? originalTotal - overrideTotalPrice
        : undefined;

      const itemOverridesDiscount = itemsDiscountedCostInCents
        ? itemsOriginalCostInCents - itemsDiscountedCostInCents
        : undefined;

      const discountApplied = Number(
        (totalOverrideOfOriginalTotal &&
          totalOverrideOfOriginalTotal + (itemOverridesDiscount || 0)) ||
          itemOverridesDiscount ||
          memberTotalDiscount
      );

      return {
        total,
        subTotal,
        originalSubTotal: itemsCostInCents,
        shippingCost: order?.shipping?.shippingCost || shippingCost,
        memberTotalDiscount,
        memberShippingDiscount,
        originalTotal,
        overrideTotalPrice,
        discountApplied,
      };
    });
  });
};

const calcAmountOfProducts = (order: Order) => {
  return (
    order?.items?.reduce(
      (partialSum: number, item: OrderItem) => partialSum + item.quantity,
      0
    ) || 0
  );
};
