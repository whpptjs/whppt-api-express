import { calculateMembersTotalSavings } from './membersTotalSavings';
import { calculateMemberShippingSavings } from './membersShippingSavings';
import { Order, OrderItemWithProduct, ShippingCost } from '../../Models/Order';
import { MembershipTier } from 'src/modules/membershipTier/Models/MembershipTier';

export const calculateOrderCosts = ([shippingCost, memberTier, order]: [
  ShippingCost,
  MembershipTier,
  Order
]) => {
  const itemsCostInCents =
    order && order.items.length
      ? order.items.reduce((acc: number, item: OrderItemWithProduct) => {
          const price = Number(
            item.overidedPrice || item.overidedPrice === 0
              ? item.overidedPrice
              : item.product?.price || item.purchasedPrice
          );
          return acc + price * Number(item.quantity || 0);
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
        ).reduce((acc: number, discount: any) => acc + discount.discountApplied || 0, 0)
      : 0;

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
      ? overrideTotalPrice + postageWithDiscount
      : itemsWithDiscount + postageWithDiscount;

  const subTotal =
    overrideTotalPrice || overrideTotalPrice == 0 ? overrideTotalPrice : itemsCostInCents;
  const originalTotal = itemsWithDiscount + postageWithDiscount;

  const totalOverrideOfOriginalTotal = overrideTotalPrice
    ? itemsWithDiscount - overrideTotalPrice
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
};

const calcAmountOfProducts = (order: Order) => {
  return (
    order?.items?.reduce((partialSum: number, item: OrderItemWithProduct) => {
      const packItemsQuantity = item?.product?.customFields?.packItems?.reduce(
        (ps: any, pi: any) => ps + pi.qty,
        0
      );
      if (!packItemsQuantity || packItemsQuantity === 0)
        return partialSum + item.quantity;
      return partialSum + item.quantity * packItemsQuantity;
    }, 0) || 0
  );
};

// const amountOfProducts = useMemo(() => {
//   return (
//     order?.items?.reduce((partialSum, item) => {
//       const packItemsQuantity = item?.product?.customFields?.packItems?.reduce(
//         (ps: any, pi: any) => ps + pi.qty,
//         0
//       );
//       if (!packItemsQuantity || packItemsQuantity === 0)
//         return partialSum + item.quantity;
//       return partialSum + item.quantity * packItemsQuantity;
//     }, 0) || 0
//   );
// }, [order?.items]);
