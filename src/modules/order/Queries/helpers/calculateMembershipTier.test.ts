import { calculateMembershipTier } from './calculateMembershipTier';
import { tiers as membershipTiers } from './tiersForTesting';
describe('Calculate membership tier', () => {
  it('Given fresh user - will be FF ', () => {
    const currentYear = {
      amount: 0,
      discountApplied: 0,
      amountWithDiscount: 0,
    };
    const previousYear = {
      amount: 0,
      discountApplied: 0,
      amountWithDiscount: 0,
    };
    const tier = calculateMembershipTier(
      { _id: '', membershipTiers },
      currentYear,
      previousYear
    );

    expect(tier.level).toEqual(1);
    expect(tier.name).toEqual('Friends of the Farm - FF (Complimentary)');
    expect(tier.shortName).toEqual('FF');
    expect(tier.entryLevelSpend).toEqual(0);
    expect(tier.amountSpentForYear).toEqual(0);
    expect(tier.discountAppliedForYear).toEqual(0);
    expect(tier.amountToSpendToNextTier).toEqual(100000);
    expect(tier.nextTiers?.length).toEqual(2);
  });
  it('Given user that has spent 1500 this year - will be TR, $500 left to CC', () => {
    const currentYear = {
      amount: 1500 * 100,
      discountApplied: 150 * 100,
    };
    const previousYear = {
      amount: 0,
      discountApplied: 0,
    };
    const tier = calculateMembershipTier(
      { _id: '', membershipTiers },
      currentYear,
      previousYear
    );

    expect(tier.level).toEqual(2);
    expect(tier.name).toEqual('Tally Room Member - TR');
    expect(tier.shortName).toEqual('Tally Room');
    expect(tier.entryLevelSpend).toEqual(100000);
    expect(tier.amountSpentForYear).toEqual(150000);
    expect(tier.discountAppliedForYear).toEqual(15000);
    expect(tier.amountToSpendToNextTier).toEqual(50000);
    expect(tier.nextTiers?.length).toEqual(1);
  });
  it('Given user that has spent 1500 last year - Will be TR But  $2000 to CC', () => {
    const previousYear = {
      amount: 1650 * 100,
      discountApplied: 150 * 100,
      amountWithDiscount: 1500 * 100,
    };
    const currentYear = {
      amount: 0,
      discountApplied: 0,
      amountWithDiscount: 0,
    };
    const tier = calculateMembershipTier(
      { _id: '', membershipTiers },
      currentYear,
      previousYear
    );

    expect(tier.level).toEqual(2);
    expect(tier.name).toEqual('Tally Room Member - TR');
    expect(tier.shortName).toEqual('Tally Room');
    expect(tier.entryLevelSpend).toEqual(100000);
    expect(tier.amountSpentForYear).toEqual(0);
    expect(tier.discountAppliedForYear).toEqual(0);
    expect(tier.amountToSpendToNextTier).toEqual(200000);
    expect(tier.nextTiers?.length).toEqual(1);
  });
  it('Given user that has spent 2500 this year -- will be CC', () => {
    const currentYear = {
      amount: 2650 * 100,
      discountApplied: 250 * 100,
      amountWithDiscount: 2500 * 100,
    };
    const previousYear = {
      amount: 0,
      discountApplied: 0,
      amountWithDiscount: 0,
    };
    const tier = calculateMembershipTier(
      { _id: '', membershipTiers },
      currentYear,
      previousYear
    );

    expect(tier.level).toEqual(3);
    expect(tier.name).toEqual('Clos Otto Club Member - CC');
    expect(tier.shortName).toEqual('Clos Member');
    expect(tier.entryLevelSpend).toEqual(200000);
    expect(tier.amountSpentForYear).toEqual(265000);
    expect(tier.discountAppliedForYear).toEqual(25000);
    expect(tier.amountToSpendToNextTier).toEqual(0);
    expect(tier.nextTiers?.length).toEqual(0);
  });

  it('Given user that has spent 1200 last year and 100 this year -- TR but $1900 to CC', () => {
    const currentYear = {
      amount: 100 * 100,
      discountApplied: 10 * 100,
    };
    const previousYear = {
      amount: 1200 * 100,
      discountApplied: 120 * 100,
    };
    const tier = calculateMembershipTier(
      { _id: '', membershipTiers },
      currentYear,
      previousYear
    );

    expect(tier.level).toEqual(2);
    expect(tier.name).toEqual('Tally Room Member - TR');
    expect(tier.shortName).toEqual('Tally Room');
    expect(tier.entryLevelSpend).toEqual(100000);
    expect(tier.amountSpentForYear).toEqual(10000);
    expect(tier.discountAppliedForYear).toEqual(1000);
    expect(tier.amountToSpendToNextTier).toEqual(190000);
    expect(tier.nextTiers?.length).toEqual(1);
  });

  it('Given No tiers are set up', () => {
    const currentYear = {
      amount: 0,
      discountApplied: 0,
      amountWithDiscount: 0,
    };
    const previousYear = {
      amount: 0,
      discountApplied: 0,
      amountWithDiscount: 0,
    };
    try {
      const tier = calculateMembershipTier(
        { _id: '', membershipTiers: [] },
        currentYear,
        previousYear
      );
      expect(tier).toBeUndefined();
    } catch (err: any) {
      expect(err.message).toEqual('Membership tiers not defined.');
    }
  });
});
