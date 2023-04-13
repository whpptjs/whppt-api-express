import { MembershipTier } from 'src/modules/membershipTier/Models/MembershipTier';
import { ShippingCost } from '../../Models/Order';

export const calculateMemberShippingSavings = (
  tier: MembershipTier,
  shippingCost: ShippingCost,
  itemsCostInCents: number,
  purchaseTotalDiscount: number,
  amountOfProducts: number,
  amountSpentForYear: number
) => {
  if (!tier?.discounts) return 0;

  let selectedDiscountTier: MembershipTier = tier;

  if (tier.nextTiers?.length) {
    tier.nextTiers?.sort((a, b) => a.entryLevelSpend - b.entryLevelSpend);

    tier.nextTiers?.forEach(tier => {
      if (
        amountSpentForYear + itemsCostInCents - purchaseTotalDiscount >=
        tier.entryLevelSpend
      )
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
