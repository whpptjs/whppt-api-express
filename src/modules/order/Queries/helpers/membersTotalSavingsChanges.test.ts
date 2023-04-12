import { calculateMembersTotalSavings } from './membersTotalSavingsChanges';

describe('Member Discount', () => {
  describe('Given a new member spends $4000', () => {
    const spentThisYear = 0;
    it('it should give all three discounts', () => {
      const currentPurchaseAmount = 4000;
      const amountOfProducts = 6;
      const { discounts } = calculateMembersTotalSavings(
        tiers,
        currentPurchaseAmount,
        spentThisYear,
        amountOfProducts
      );

      expect(discounts).toEqual(true);
    });
  });
});

const tiers = [
  {
    _id: '7MYh2mUTrwO12g4rC3Xez',
    name: 'Friends of the Farm',
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
    name: 'Tally Room Member',
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
    name: 'Clos Otto Club Member',
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
