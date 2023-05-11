import { orderBy } from 'lodash';
import {
  MembershipOptions,
  MembershipTier,
} from '../../../membershipTier/Models/MembershipTier';

type MembershipYearlyCalc = {
  amount: number;
  discountApplied: number;
};

export type CalculateMembershipTier = (
  membershipOptions: MembershipOptions,
  currentYear: MembershipYearlyCalc,
  previousYear: MembershipYearlyCalc
) => MembershipTier;

export const calculateMembershipTier: CalculateMembershipTier = (
  membershipOptions,
  currentYear,
  previousYear
) => {
  const sortedTiers = orderBy(
    membershipOptions.membershipTiers,
    ['level'],
    ['desc']
  ) as MembershipTier[];

  const baseTier = sortedTiers.find(st => st.level === 1);

  if (!baseTier) throw new Error('Membership tiers not defined.');

  const currentYearTier = sortedTiers.find(t => t.entryLevelSpend <= currentYear.amount);
  const lastYearTier = sortedTiers.find(t => t.entryLevelSpend <= previousYear.amount);

  const currentTierLevel = (currentYearTier && currentYearTier?.level) || 1;
  const lastYearTierLevel = (lastYearTier && lastYearTier?.level) || 1;
  const currentTier =
    currentYearTier && lastYearTier
      ? currentTierLevel >= lastYearTierLevel
        ? currentYearTier
        : lastYearTier
      : baseTier;
  const nextTierLevel = (currentTier?.level || 0) + 1;
  const nextTier = sortedTiers.find(t => t.level === nextTierLevel);

  return {
    ...currentTier,
    discountAppliedForYear: currentYear.discountApplied,
    amountSpentForYear: currentYear.amount,
    amountSpentWithDiscount: currentYear.amount,
    amountToSpendToNextTier: nextTier ? nextTier.entryLevelSpend - currentYear.amount : 0,
    nextTiers: calculateNextTiers(
      membershipOptions.membershipTiers,
      currentTier,
      currentYear
    ),
  } as MembershipTier;
};

const calculateNextTiers = (
  tiers: MembershipTier[],
  currentTier: MembershipTier,
  currentYear: MembershipYearlyCalc
) => {
  const nextTiers: MembershipTier[] = currentTier
    ? tiers.filter(t => t.level > currentTier.level)
    : tiers;

  return nextTiers.map((t, i) => ({
    ...t,
    amountToSpendToNextTier:
      i === 0
        ? t.entryLevelSpend - currentYear.amount
        : calculatePreviousTiers(tiers, i) - currentYear.amount,
  }));
};

const calculatePreviousTiers = (tiers: MembershipTier[], currentTierIndex: number) => {
  const totalToSpendInThisAndPrevTiers =
    tiers.reduce((acc, t, i) => {
      if (currentTierIndex < i) {
        return acc + t.entryLevelSpend;
      }

      return acc;
    }, 0) || 0;

  return totalToSpendInThisAndPrevTiers;
};
