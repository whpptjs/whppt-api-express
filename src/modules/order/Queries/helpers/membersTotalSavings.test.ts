import { calculateMembersTotalSavings } from './membersTotalSavings';
const { round } = require('lodash');

describe('Member Total Discount', () => {
  describe('Given a new member spends $4000', () => {
    const spentThisYear = 0;
    it('it should give all three discounts', () => {
      const currentPurchaseAmount = 4000 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );

      const { ffTier, trTier, coTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(111.11);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(2888.89);
      expect(round(trTier.discountApplied / 100, 2)).toEqual(250);
      expect(round(trTier.remainingSubtotal / 100, 2)).toEqual(1638.9);
      expect(round(coTier.discountApplied / 100, 2)).toEqual(409.72);
    });
  });

  describe('Given a exisitng member spends $4000, and has spent $720 this period', () => {
    const spentThisYear = 720 * 100;
    it('it should give all three discounts', () => {
      const currentPurchaseAmount = 4000 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier, trTier, coTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(31.11);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(3688.89);
      expect(round(trTier.discountApplied / 100, 2)).toEqual(250);
      expect(round(trTier.remainingSubtotal / 100, 2)).toEqual(2438.9);
      expect(round(coTier.discountApplied / 100, 2)).toEqual(609.73);
    });
  });

  describe('Given a exisitng member spends $4000, and has spent $4000 this period', () => {
    const spentThisYear = 4000 * 100;
    it('it should give only CO disocunts', () => {
      const currentPurchaseAmount = 4000 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(0);
      expect(round(ffTier.remainingSubtotal)).toEqual(spentThisYear);
    });
  });

  describe('Given a exisitng member spends $800, and has spent $1000 this period', () => {
    const spentThisYear = 1000 * 100;
    it('it should apply only TR discount', () => {
      const currentPurchaseAmount = 800 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier, trTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(0);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(800);
      expect(round(trTier.discountApplied / 100, 2)).toEqual(160);
      expect(round(trTier.remainingSubtotal / 100, 2)).toEqual(0);
    });
  });

  describe('Given a exisitng member spends $1500, and has spent $0 this period', () => {
    const spentThisYear = 0;
    it('it should apply FF and TR discounts', () => {
      const currentPurchaseAmount = 1500 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier, trTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(111.11);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(388.89);
      expect(round(trTier.discountApplied / 100, 2)).toEqual(77.78);
      expect(round(trTier.remainingSubtotal / 100, 2)).toEqual(0);
    });
  });

  describe('Given a exisitng member spends $800, and has spent $0 this period', () => {
    const spentThisYear = 0;
    it('it should apply FF', () => {
      const currentPurchaseAmount = 800 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(80);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(0);
    });
  });
  describe('Given a exisitng member spends $300, and has spent $720 this period', () => {
    const spentThisYear = 72000;
    it('it should apply FF', () => {
      const currentPurchaseAmount = 300 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(30);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(0);
    });
  });

  describe('Given a exisitng member spends $3500, and has spent $0 this period', () => {
    const spentThisYear = 0 * 100;
    it('it should give all three discounts', () => {
      const currentPurchaseAmount = 3500 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier, trTier, coTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(111.11);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(2388.89);
      expect(round(trTier.discountApplied / 100, 2)).toEqual(250);
      expect(round(trTier.remainingSubtotal / 100, 2)).toEqual(1138.9);
      expect(round(coTier.discountApplied / 100, 2)).toEqual(284.72);
    });
  });

  describe('Given a exisitng member spends $3500, and has spent $1800 this period', () => {
    const spentThisYear = 1800 * 100;
    it('it should give TR and CO discounts', () => {
      const currentPurchaseAmount = 3500 * 100;
      const amountOfProducts = 6;
      const discounts = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );
      const { ffTier, trTier, coTier } = getTierDiscounts(discounts);

      expect(round(ffTier.discountApplied / 100, 2)).toEqual(0);
      expect(round(ffTier.remainingSubtotal / 100, 2)).toEqual(3500);
      expect(round(trTier.discountApplied / 100, 2)).toEqual(50);
      expect(round(trTier.remainingSubtotal / 100, 2)).toEqual(3250.01);
      expect(round(coTier.discountApplied / 100, 2)).toEqual(812.5);
    });
  });
});

const getTierDiscounts = (discounts: any[]) => {
  const ffTier = discounts.find(t => t.level === 1);
  const trTier = discounts.find(t => t.level === 2);
  const coTier = discounts.find(t => t.level === 3);

  return { ffTier, trTier, coTier };
};

const tiers = [
  {
    _id: '7MYh2mUTrwO12g4rC3Xez',
    name: 'Friends of the Farm - FF (Complimentary)',
    discounts: [
      {
        _id: 'er55oyn0KMNRvdAMX3K3-',
        appliedTo: 'total' as 'total',
        type: 'percentage' as 'percentage',
        value: 10,
        shipping: {},
        minItemsRequiredForDiscount: 6,
      },
    ],
    level: 1,
    entryLevelSpend: 0,
    messageToMembers: {
      link: { type: 'page' as 'page', href: '/shop', text: 'Shop Now' },
      _id: 'rcHwvFiXNICN5Zw6zly97',
      message:
        "Hey Tom, Here's a test message for your review when conducting QA and functionality testing.",
      title: 'Test message ',
    },
    shortName: 'FF',
    amountSpentForYear: 0,
    amountToSpendToNextTier: 100000,
  },
  {
    _id: '82GWdv2CbRMMR_745Pxqc',
    name: 'Tally Room Member - TR',
    discounts: [
      {
        _id: 'swPC9ktM3lY8Xv-YOMv0c',
        appliedTo: 'total' as 'total',
        type: 'percentage' as 'percentage',
        value: 20,
        shipping: {},
      },
    ],
    level: 2,
    entryLevelSpend: 100000,
    shortName: 'Tally Room',
    messageToMembers: {
      link: { type: 'page' as 'page', text: 'Test test', href: '/shop' },
      _id: 'iolfLoLkdfnWBzDEvT_lx',
      title: 'Welcome!',
      message:
        'The 2020 Clos Otto Shiraz will be available to Tally Room Members shortly.',
    },
    amountSpentForYear: 0,
    amountToSpendToNextTier: 100000,
  },
  {
    _id: '29lRIFebMkUQgvHY72zyp',
    name: 'Clos Otto Club Member - CC',
    discounts: [
      {
        _id: 'VYHbg-au-lanO6_LTCYpq',
        appliedTo: 'total' as 'total',
        type: 'percentage' as 'percentage',
        value: 25,
        shipping: {},
      },
      {
        _id: '2w7ioZmfHZYa4AadKhpqU',
        appliedTo: 'shipping' as 'shipping',
        type: 'percentage' as 'percentage',
        value: 100,
        shipping: {
          text: 'Australian Metro',
          value: 'aus_metro',
          constraint: 'postcodeGrouping',
        },
      },
      {
        _id: 'jSUgyunG_-rGyqXRbk7Ov',
        appliedTo: 'shipping' as 'shipping',
        type: 'flat' as 'flat',
        value: 2000,
        shipping: {
          text: 'Australian Regional',
          value: 'aus_regional',
          constraint: 'postcodeGrouping',
        },
      },
    ],
    level: 3,
    entryLevelSpend: 200000,
    messageToMembers: {
      link: { type: 'page' as 'page', text: 'Test test', href: '/about' },
      _id: '7OK_dzFF9lEt09NQiOfTt',
      title: 'Welcome!',
      message: 'You allocation of the 2020 Clos Otto Shiraz is now available',
    },
    shortName: 'Clos Member',
    amountSpentForYear: 0,
    amountToSpendToNextTier: 200000,
  },
];
