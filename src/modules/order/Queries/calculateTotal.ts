import { ContextType } from 'src/context/Context';
import { MembershipTier } from 'src/modules/membershipTier/Models/MembershipTier';
import { Order, OrderItem, OrderItemWithProduct, ShippingCost } from '../Models/Order';
import { getShippingCost } from './getShippingCost';
import { loadOrderWithProducts } from './loadOrderWithProducts';
import { queryMemberTier } from './queryMemberTier';
import { queryMemberAmountSpentForYear } from './queryMemberAmountSpentForYear';

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
        postcode: order.shipping?.address?.postCode,
        pickup: order.shipping?.pickup || false,
        domainId,
        override: order?.shipping?.shippingCost?.override
          ? order?.shipping?.shippingCost
          : ({} as ShippingCost),
      }),
      queryMemberTier(ctx, { domainId, memberId, orderId }),
      queryMemberAmountSpentForYear(ctx, { memberId }),
    ]).then(([shippingCost, memberTier, amountSpentForYear]) => {
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
        memberTier?.discounts && !overrideTotalPrice
          ? membersTotalSavings(
              memberTier,
              itemsCostInCents,
              amountOfProducts,
              amountSpentForYear
            )
          : 0;

      const memberShippingDiscount =
        memberTier?.discounts && !overrideTotalPrice
          ? membersShippingSaving(
              memberTier,
              shippingCost,
              itemsCostInCents,
              amountOfProducts,
              amountSpentForYear
            )
          : 0;

      const itemsWithDiscount =
        itemsDiscountedCostInCents > 0
          ? Number(itemsCostInCents)
          : Number(itemsCostInCents) - memberTotalDiscount < 0
          ? 0
          : Number(itemsCostInCents) - memberTotalDiscount;
      const postageWithDiscount =
        itemsDiscountedCostInCents > 0
          ? Number(postageCostInCents)
          : Number(postageCostInCents) - memberShippingDiscount < 0
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

const membersTotalSavings = (
  tier: MembershipTier,
  subTotal: number,
  amountOfProducts: number,
  amountSpentForYear: number
) => {
  const calculateDiscountAmount =
    (tierBase: number) => (partialSum: number, discount: any) => {
      if (discount.appliedTo === 'shipping') return partialSum + 0;
      if (
        discount.minItemsRequiredForDiscount &&
        discount.minItemsRequiredForDiscount > amountOfProducts
      )
        return partialSum + 0;
      if (discount.type === 'flat') return partialSum + discount.value;

      return partialSum + tierBase * (discount.value / 100);
    };

  const applyDiscountsRecursively: any = (
    tiers: any,
    remainingSubTotal: number,
    amountSpent: number,
    discounts: any,
    nextTierIndex = 0
  ) => {
    const tier = tiers[nextTierIndex];
    if (!tier) return discounts;

    const nextTier = tiers[nextTierIndex + 1];
    let tierBase = nextTier
      ? Math.min(nextTier.entryLevelSpend - amountSpent, remainingSubTotal)
      : remainingSubTotal;
    let discountAmount = tier.discounts.reduce(calculateDiscountAmount(tierBase), 0);

    discounts.push({
      amount: Number(discountAmount.toFixed(2)),
      tier: tier.name,
    });

    const updatedSubtotal =
      remainingSubTotal - (nextTierIndex === 0 ? tierBase + discountAmount : tierBase);
    const updatedAmountSpent = amountSpent + tierBase;

    if (updatedSubtotal > 0 && nextTier) {
      return applyDiscountsRecursively(
        tiers,
        updatedSubtotal,
        updatedAmountSpent,
        discounts,
        nextTierIndex + 1
      );
    } else {
      return discounts;
    }
  };

  const discounts = applyDiscountsRecursively(
    [tier, ...tier.nextTiers],
    subTotal,
    amountSpentForYear,
    []
  );

  return Number(
    discounts.reduce((acc: number, discount: any) => {
      return acc + discount.amount;
    }, 0)
  );
};

const membersShippingSaving = (
  tier: MembershipTier,
  shippingCost: ShippingCost,
  itemsCostInCents: number,
  amountOfProducts: number,
  amountSpentForYear: number
) => {
  if (!tier?.discounts) return 0;

  let selectedDiscountTier: MembershipTier = tier;

  if (tier.nextTiers.length) {
    tier.nextTiers.sort((a, b) => a.entryLevelSpend - b.entryLevelSpend);

    tier.nextTiers.forEach(tier => {
      if (amountSpentForYear + itemsCostInCents >= tier.entryLevelSpend)
        selectedDiscountTier = tier;
    });
  }

  return selectedDiscountTier?.discounts?.reduce(getDiscountedAmount, 0);

  function getDiscountedAmount(partialSum: number, discount: any) {
    if (discount.appliedTo === 'total') return partialSum + 0;
    if (
      discount.minItemsRequiredForDiscount &&
      discount.minItemsRequiredForDiscount > amountOfProducts
    )
      return partialSum + 0;

    if (discount?.shipping?.value !== shippingCost.type) return partialSum + 0;

    if (discount.type === 'flat') return partialSum + discount.value;

    return partialSum + Number(shippingCost.price) * (discount.value / 100);
  }
};
