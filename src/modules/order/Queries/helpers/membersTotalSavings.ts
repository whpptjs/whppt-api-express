import { MembershipTier } from 'src/modules/membershipTier/Models/MembershipTier';
const { round } = require('lodash');

export type CalculateMembersTotalSavingsArgs = (
  tiers: MembershipTier[],
  currentPurchaseAmount: number,
  spentThisPeriod: number,
  amountOfProducts: number,
  lockToTier?: string
) => any[];

export const calculateMembersTotalSavings: CalculateMembersTotalSavingsArgs = (
  tiers,
  currentPurchaseAmount,
  spentThisYear,
  amountOfProducts,
  lockToTier
) => {
  const discounts: any[] = [];

  if (lockToTier) {
    const lockedTier = tiers.find(t => t._id === lockToTier);
    if (!lockedTier) return [];

    discounts.push({
      name: lockedTier.name,
      level: lockedTier.level,
      discountApplied: lockedTier.discounts.reduce(
        calculateDiscountAmount(currentPurchaseAmount, amountOfProducts),
        0
      ),
    });

    return discounts;
  }

  const ffTier = tiers.find(t => t.level === 1);
  const trTier = tiers.find(t => t.level === 2);
  const coTier = tiers.find(t => t.level === 3);

  const { remainingSubtotalAfterFFDiscount, ffDiscountApplied } = buildFFDiscount(
    currentPurchaseAmount,
    spentThisYear,
    ffTier,
    trTier,
    amountOfProducts
  );

  discounts.push({
    name: ffTier?.name,
    level: ffTier?.level,
    discountApplied: ffDiscountApplied,
    remainingSubtotal: remainingSubtotalAfterFFDiscount,
  });

  if (!remainingSubtotalAfterFFDiscount) return discounts;

  const { remainingSubtotalAfterTRDiscount, trDiscountApplied } = buildTRDiscount(
    remainingSubtotalAfterFFDiscount,
    spentThisYear,
    trTier,
    coTier,
    amountOfProducts,
    ffDiscountApplied
  );

  discounts.push({
    name: trTier?.name,
    level: trTier?.level,
    discountApplied: trDiscountApplied,
    remainingSubtotal: remainingSubtotalAfterTRDiscount,
  });

  if (!remainingSubtotalAfterTRDiscount) return discounts;

  const { coDiscountApplied } = buildCODiscount(
    remainingSubtotalAfterTRDiscount,
    coTier,
    amountOfProducts
  );

  discounts.push({
    name: coTier?.name,
    level: coTier?.level,
    discountApplied: coDiscountApplied,
  });

  return discounts;
};

const buildFFDiscount: any = (
  currentPurchaseAmount: number,
  spentThisYear: number,
  ffTier: MembershipTier,
  trTier: MembershipTier,
  amountOfProducts: number
) => {
  if (!ffTier) {
    return {
      remainingSubtotalAfterFFDiscount: currentPurchaseAmount,
      ffDiscountApplied: 0,
    };
  }

  const tierLimit = getTierLimit(trTier, spentThisYear);
  const upperLimitDiscount = getUpperTierLimitDelta(tierLimit, ffTier.discounts[0].value);
  const tierTreshold = tierLimit + upperLimitDiscount;

  if (!tierTreshold)
    return {
      remainingSubtotalAfterFFDiscount: currentPurchaseAmount,
      ffDiscountApplied: 0,
    };

  const tierMaxAmountSpend =
    currentPurchaseAmount < tierTreshold ? currentPurchaseAmount : tierTreshold;
  const discount = ffTier.discounts.reduce(
    calculateDiscountAmount(tierMaxAmountSpend, amountOfProducts, ffTier),
    0
  );

  return {
    remainingSubtotalAfterFFDiscount: sumRemaining(
      currentPurchaseAmount,
      discount,
      tierLimit
    ),
    ffDiscountApplied: round(discount, 2),
  };
};

const buildTRDiscount: any = (
  remainingSubtotalAfterFFDiscount: number,
  spentThisYear: number,
  trTier: MembershipTier,
  coTier: MembershipTier,
  amountOfProducts: number,
  ffDiscountApplied: number
) => {
  if (!trTier) {
    return {
      remainingSubtotalAfterTRDiscount: remainingSubtotalAfterFFDiscount,
      ffDiscountApplied: 0,
    };
  }

  const prevTierLimit = getTierLimit(trTier, spentThisYear);
  const tierLimit = getTierLimit(coTier, spentThisYear);
  const upperLimitDiscount = getUpperTierLimitDelta(
    tierLimit - prevTierLimit,
    trTier.discounts[0].value
  );
  const tierTreshold =
    tierLimit - (ffDiscountApplied ? prevTierLimit : 0) + upperLimitDiscount;

  if (!tierTreshold)
    return {
      remainingSubtotalAfterTRDiscount: remainingSubtotalAfterFFDiscount,
      trDiscountApplied: 0,
    };

  const tierMaxAmountSpend =
    remainingSubtotalAfterFFDiscount < tierTreshold
      ? remainingSubtotalAfterFFDiscount
      : tierTreshold;

  const discount = trTier.discounts.reduce(
    calculateDiscountAmount(tierMaxAmountSpend, amountOfProducts, trTier),
    0
  );

  return {
    remainingSubtotalAfterTRDiscount: sumRemaining(
      remainingSubtotalAfterFFDiscount,
      0,
      tierMaxAmountSpend
    ),
    trDiscountApplied: round(discount, 2),
  };
};

const buildCODiscount: any = (
  remainingSubtotalAfterTRDiscount: number,
  coTier: MembershipTier,
  amountOfProducts: number
) => {
  if (!coTier) {
    return {
      coDiscountApplied: 0,
    };
  }

  const discount = coTier.discounts.reduce(
    calculateDiscountAmount(remainingSubtotalAfterTRDiscount, amountOfProducts, coTier),
    0
  );

  return {
    coDiscountApplied: round(discount, 2),
  };
};

const getTierLimit = (tier: MembershipTier, spentThisYear: number) => {
  return tier.entryLevelSpend - spentThisYear < 0
    ? 0
    : tier.entryLevelSpend - spentThisYear;
};

const getUpperTierLimitDelta = (base: number, discountValue: number) => {
  let percentage = discountValue / 100;
  let discount = 0;
  let partial = base * percentage;

  while (partial >= 1) {
    discount += partial;
    partial *= percentage;
  }

  return Math.floor(discount);
};

const calculateDiscountAmount =
  (remainingToSpend: number, amountOfProducts: number, nextTier?: MembershipTier) =>
  (partialSum: number, discount: any) => {
    if (discount.appliedTo === 'shipping') return partialSum + 0;
    if (
      discount.minItemsRequiredForDiscount &&
      discount.minItemsRequiredForDiscount > amountOfProducts
    )
      return partialSum + 0;
    if (discount.type === 'flat') return partialSum + discount.value;
    if (!nextTier) return (remainingToSpend * discount.value) / 100;

    return (remainingToSpend * discount.value) / 100;
  };

const sumRemaining = (currentPurchaseAmount = 0, discount = 0, tierLimit = 0) => {
  const remainingSubtotalAfterFFDiscount = round(
    currentPurchaseAmount - discount - tierLimit,
    2
  );
  return remainingSubtotalAfterFFDiscount > 0 ? remainingSubtotalAfterFFDiscount : 0;
};
