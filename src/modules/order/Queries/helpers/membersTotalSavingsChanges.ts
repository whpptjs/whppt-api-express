import { MembershipTier } from 'src/modules/membershipTier/Models/MembershipTier';

export type CalculateMembersTotalSavingsArgs = (
  tiers: MembershipTier[],
  currentPurchaseAmount: number,
  spentThisYear: number,
  amountOfProducts: number
) => { total: number; discounts: number };

export const calculateMembersTotalSavings: CalculateMembersTotalSavingsArgs = (
  tiers,
  currentPurchaseAmount,
  spentThisYear,
  amountOfProducts
) => {
  // const calculateDiscountAmount =
  //   (remainingToSpend: number, tier: MembershipTier, amountSpentForYear: number, nextTier?: MembershipTier) =>
  //   (partialSum: number, discount: any) => {
  //     if (discount.appliedTo === 'shipping') return partialSum + 0;
  //     if (discount.minItemsRequiredForDiscount && discount.minItemsRequiredForDiscount > amountOfProducts) return partialSum + 0;
  //     if (discount.type === 'flat') return partialSum + discount.value;

  //     if (!nextTier) return (remainingToSpend * discount.value) / 100;

  //     const tierLimit = nextTier.entryLevelSpend - tier.entryLevelSpend;
  //     const deltaToSpend = maxTeirSpendDiscountDelta(tierLimit, discount.value / 100);
  //     const maxTierToSpend = (tier.amountToSpendToNextTier || 0) + deltaToSpend - (amountSpentForYear - nextTier.entryLevelSpend);

  //     const tierBase = nextTier ? (remainingToSpend > maxTierToSpend ? maxTierToSpend : remainingToSpend) : remainingToSpend;
  //     const discountAmount = getFullDiscoutnAmount2(tierBase, tierLimit, discount.value / 100);
  //     return {
  //       discountAmount,
  //       tierBase,
  //     };
  //   };

  // const getFullDiscountAmmount = (tierBase: number, percentage: number) => {
  //   let discount = 0;
  //   let partial = tierBase * percentage;

  //   while (partial >= 1) {
  //     discount += partial;
  //     partial *= percentage;
  //   }

  //   return Math.floor(discount);
  // };

  // const getFullDiscoutnAmount2 = (remainingToSpend: number, tierBase: number, percentage: number) => {
  //   const tierMax = tierBase + maxTeirSpendDiscountDelta(tierBase, percentage);

  //   return remainingToSpend > tierMax ? tierMax * percentage : remainingToSpend * percentage;
  // };

  // const maxTeirSpendDiscountDelta = (tierBase: number, basePercentage: number) => {
  //   let upperLimitDiscount = 0;
  //   let partial = tierBase * basePercentage;
  //   while (partial >= 1) {
  //     upperLimitDiscount += partial;
  //     partial *= basePercentage;
  //   }
  //   return Math.floor(upperLimitDiscount);
  // };

  // const applyDiscountsRecursively: any = (
  //   tiers: any,
  //   remainingSubTotal: number,
  //   amountSpent: number,
  //   _discounts: any,
  //   nextTierIndex = 0
  // ) => {
  //   const tier = tiers[nextTierIndex];
  //   if (!tier) return _discounts;

  //   const nextTier = tiers[nextTierIndex + 1];

  //   // const tierLimit = nextTier.entryLevelSpend - tier.entryLevelSpend;
  //   // const deltaToSpend = maxTeirSpendDiscountDelta(tierLimit, tier.value / 100);
  //   // const maxTierToSpend = tier.amountToSpendToNextTier + deltaToSpend;

  //   // const tierBase = nextTier ? (remainingSubTotal > maxTierToSpend ? maxTierToSpend : remainingSubTotal) : remainingSubTotal;

  //   const { discountAmount, tierBase } = tier.discounts.reduce(calculateDiscountAmount(remainingSubTotal, tier, amountSpent, nextTier), 0);

  //   _discounts.push({
  //     amount: Number(discountAmount.toFixed(2)),
  //     tier: tier.name,
  //   });

  //   const updatedSubtotal = remainingSubTotal - tierBase - discountAmount;
  //   const updatedAmountSpent = amountSpent + tierBase + discountAmount;

  //   if (updatedSubtotal > 0 && nextTier) {
  //     return applyDiscountsRecursively(tiers, updatedSubtotal, updatedAmountSpent, _discounts, nextTierIndex + 1);
  //   } else {
  //     return _discounts;
  //   }
  // };

  // const discounts = applyDiscountsRecursively(
  //   [tier, ...(tier.nextTiers?.length ? tier.nextTiers : [null])],
  //   subTotal,
  //   tier.amountSpentForYear || 0,
  //   []
  // );

  // return discounts;
  const buildFFDiscount = (
    currentPurchaseAmount: number,
    spentThisYear: number,
    ffTier: MembershipTier,
    trTier: MembershipTier
  ) => {
    const tierLimit =
      trTier.entryLevelSpend - spentThisYear < 0
        ? 0
        : trTier.entryLevelSpend - spentThisYear;
    const upperLimitDiscount = getUpperTierLimitDetla(tierLimit, ffTier);

    // const { discountAmount, tierBase } = tier.discounts.reduce(
    //   calculateDiscountAmount(remainingSubTotal, tier, amountSpent, nextTier),
    //   0
    // );
  };

  const getUpperTierLimitDetla = (base: number, percentage: number) => {
    let discount = 0;
    let partial = base * percentage;

    while (partial >= 1) {
      discount += partial;
      partial *= percentage;
    }

    return Math.floor(discount);
  };
  const calculateDiscountsApplied =
    (
      remainingToSpend: number,
      spentThisYear: number,
      tier: MembershipTier,
      nextTier?: MembershipTier
    ) =>
    (partialSum: number, discount: any) => {
      if (discount.appliedTo === 'shipping') return partialSum + 0;
      if (
        discount.minItemsRequiredForDiscount &&
        discount.minItemsRequiredForDiscount > amountOfProducts
      )
        return partialSum + 0;
      if (discount.type === 'flat') return partialSum + discount.value;

      if (!nextTier) return (remainingToSpend * discount.value) / 100;

      const tierLimit =
        tier.entryLevelSpend - spentThisYear < 0
          ? 0
          : tier.entryLevelSpend - spentThisYear;

      const upperLimitDiscount =
        getUpperTierLimitDetla(tierLimit, discount.value) + tierLimit;
      console.log('🚀 upperLimitDiscount:', upperLimitDiscount);

      // const deltaToSpend = maxTeirSpendDiscountDelta(tierLimit, discount.value / 100);
      // const maxTierToSpend =
      //   (tier.amountToSpendToNextTier || 0) +
      //   deltaToSpend -
      //   (amountSpentForYear - nextTier.entryLevelSpend);

      // const tierBase = nextTier
      //   ? remainingToSpend > maxTierToSpend
      //     ? maxTierToSpend
      //     : remainingToSpend
      //   : remainingToSpend;
      // const discountAmount = getFullDiscoutnAmount2(
      //   tierBase,
      //   tierLimit,
      //   discount.value / 100
      // );
      // return {
      //   discountAmount,
      //   tierBase,
      // };
    };

  const ffTier = tiers.find(t => t.name === 'Friends of the Farm');
  const trTier = tiers.find(t => t.name === 'Tally Room Member');
  const ccTier = tiers.find(t => t.name === 'Clos Otto Club Member');

  const { ffRemaining, ffDiscountApplied } = buildFFDiscount(
    currentPurchaseAmount,
    spentThisYear,
    ffTier,
    trTier
  );

  return {
    total: ffRemaining,
    discounts: ffDiscountApplied,
  };
};
