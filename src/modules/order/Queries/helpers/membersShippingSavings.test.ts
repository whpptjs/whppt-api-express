import { ShippingCost } from './../../Models/Order';
import { MembershipTier } from './../../../membershipTier/Models/MembershipTier';
import { calculateMemberShippingSavings } from './membersShippingSavings';
const { round } = require('lodash');

describe('Member Shipping Discount', () => {
  it('Given a new member (FF tier) makes a $1000 purchase, with $500 discount in items total, and $20 shipping cost. The post code is metro', () => {
    const ffTier = tiers.find(t => t.name === 'Friends of the Farm - FF (Complimentary)');

    if (!ffTier) throw new Error('FF tier not found');

    const amountSpentForYear = 0 * 100;
    const itemsCostInCents = 1000 * 100;
    const purchaseTotalDiscount = 500 * 100;
    const shippingCost = { price: 20 * 100, type: 'aus_metro' } as ShippingCost;
    const amountOfProducts = 6;

    const shippingDiscount = calculateMemberShippingSavings(
      ffTier as MembershipTier,
      shippingCost,
      itemsCostInCents,
      purchaseTotalDiscount,
      amountOfProducts,
      amountSpentForYear
    );

    expect(round(shippingDiscount / 100, 2)).toEqual(0);
  });

  it('Given a new member (FF tier) makes a $1000 purchase, with $300 discount in items total, and $20 shipping cost. The post code is regional', () => {
    const ffTier = tiers.find(t => t.name === 'Friends of the Farm - FF (Complimentary)');

    if (!ffTier) throw new Error('FF tier not found');

    const amountSpentForYear = 0 * 100;
    const itemsCostInCents = 1000 * 100;
    const purchaseTotalDiscount = 300 * 100;
    const shippingCost = { price: 20 * 100, type: 'aus_regional' } as ShippingCost;
    const amountOfProducts = 6;

    const shippingDiscount = calculateMemberShippingSavings(
      ffTier as MembershipTier,
      shippingCost,
      itemsCostInCents,
      purchaseTotalDiscount,
      amountOfProducts,
      amountSpentForYear
    );

    expect(round(shippingDiscount / 100, 2)).toEqual(0);
  });

  it('Given a member with $500 yearly spent, makes a $1000 purchase, with $50 discount in items total, and $30 shipping cost. The post code is metro', () => {
    // current tier
    const ffTier = tiers.find(t => t.name === 'Friends of the Farm - FF (Complimentary)');

    if (!ffTier) throw new Error('FF tier not found');

    const amountSpentForYear = 500 * 100;
    const itemsCostInCents = 1000 * 100;
    const purchaseTotalDiscount = 50 * 100;
    const shippingCost = { price: 30 * 100, type: 'aus_metro' } as ShippingCost;
    const amountOfProducts = 6;

    const shippingDiscount = calculateMemberShippingSavings(
      ffTier as MembershipTier,
      shippingCost,
      itemsCostInCents,
      purchaseTotalDiscount,
      amountOfProducts,
      amountSpentForYear
    );

    expect(round(shippingDiscount / 100, 2)).toEqual(3);
  });

  it('Given a member with $500 yearly spent, makes a $1000 purchase, with $50 discount in items total, and $30 shipping cost. The post code is regional', () => {
    // current tier
    const ffTier = tiers.find(t => t.name === 'Friends of the Farm - FF (Complimentary)');

    if (!ffTier) throw new Error('FF tier not found');

    const amountSpentForYear = 500 * 100;
    const itemsCostInCents = 1000 * 100;
    const purchaseTotalDiscount = 50 * 100;
    const shippingCost = { price: 30 * 100, type: 'aus_regional' } as ShippingCost;
    const amountOfProducts = 6;

    const shippingDiscount = calculateMemberShippingSavings(
      ffTier as MembershipTier,
      shippingCost,
      itemsCostInCents,
      purchaseTotalDiscount,
      amountOfProducts,
      amountSpentForYear
    );

    expect(round(shippingDiscount / 100, 2)).toEqual(0);
  });

  it('Given a TR member, with $1000 spent this period, makes a $1500 purchase, with $50 discount in items total, and $30 shipping cost. The post code is metro', () => {
    const trTier = tiers.find(t => t.name === 'Tally Room Member - TR');

    if (!trTier) throw new Error('TR tier not found');

    const amountSpentForYear = 1000 * 100;
    const itemsCostInCents = 1500 * 100;
    const purchaseTotalDiscount = 50 * 100;
    const shippingCost = { price: 30 * 100, type: 'aus_metro' } as ShippingCost;
    const amountOfProducts = 6;

    const shippingDiscount = calculateMemberShippingSavings(
      trTier as MembershipTier,
      shippingCost,
      itemsCostInCents,
      purchaseTotalDiscount,
      amountOfProducts,
      amountSpentForYear
    );

    expect(round(shippingDiscount / 100, 2)).toEqual(30);
  });

  it('Given a TR member, with $1000 spent this period, makes a $1500 purchase, with $50 discount in items total, and $30 shipping cost. The post code is regional', () => {
    const trTier = tiers.find(t => t.name === 'Tally Room Member - TR');

    if (!trTier) throw new Error('TR tier not found');

    const amountSpentForYear = 1000 * 100;
    const itemsCostInCents = 1500 * 100;
    const purchaseTotalDiscount = 50 * 100;
    const shippingCost = { price: 30 * 100, type: 'aus_regional' } as ShippingCost;
    const amountOfProducts = 6;

    const shippingDiscount = calculateMemberShippingSavings(
      trTier as MembershipTier,
      shippingCost,
      itemsCostInCents,
      purchaseTotalDiscount,
      amountOfProducts,
      amountSpentForYear
    );

    expect(round(shippingDiscount / 100, 2)).toEqual(20);
  });
});

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
    nextTiers: [
      {
        _id: '82GWdv2CbRMMR_745Pxqc',
        name: 'Tally Room Member - TR',
        discounts: [
          {
            _id: 'swPC9ktM3lY8Xv-YOMv0c',
            appliedTo: 'total',
            type: 'percentage',
            value: 20,
            shipping: {},
          },
          {
            _id: 'nfBcCrstHhRc7Iv6DTKaa',
            appliedTo: 'shipping',
            type: 'percentage',
            value: 10,
            shipping: {
              text: 'Australian Metro',
              value: 'aus_metro',
              constraint: 'postcodeGrouping',
            },
          },
        ],
        level: 2,
        entryLevelSpend: 100000,
        messageToMembers: {
          link: {},
          _id: 'uEyppzdyoQS4e1K6DT5S4',
          message: 'This is a message to Tally Room type of member',
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
            appliedTo: 'total',
            type: 'percentage',
            value: 25,
            shipping: {},
          },
          {
            _id: '2w7ioZmfHZYa4AadKhpqU',
            appliedTo: 'shipping',
            type: 'percentage',
            value: 100,
            shipping: {
              text: 'Australian Metro',
              value: 'aus_metro',
              constraint: 'postcodeGrouping',
            },
          },
          {
            _id: 'jSUgyunG_-rGyqXRbk7Ov',
            appliedTo: 'shipping',
            type: 'flat',
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
          link: {
            text: 'Contact us',
            href: '/contact-test',
          },
          _id: 'hEmRi7ezUX_HPQFcW5OlJ',
          message: 'This is a message to Closs Otto type of member',
        },
        amountSpentForYear: 0,
        amountToSpendToNextTier: 200000,
      },
    ],
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
    nextTiers: [
      {
        _id: '29lRIFebMkUQgvHY72zyp',
        name: 'Clos Otto Club Member - CC',
        discounts: [
          {
            _id: 'VYHbg-au-lanO6_LTCYpq',
            appliedTo: 'total',
            type: 'percentage',
            value: 25,
            shipping: {},
          },
          {
            _id: '2w7ioZmfHZYa4AadKhpqU',
            appliedTo: 'shipping',
            type: 'percentage',
            value: 100,
            shipping: {
              text: 'Australian Metro',
              value: 'aus_metro',
              constraint: 'postcodeGrouping',
            },
          },
          {
            _id: 'jSUgyunG_-rGyqXRbk7Ov',
            appliedTo: 'shipping',
            type: 'flat',
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
          link: {
            text: 'Contact us',
            href: '/contact-test',
          },
          _id: 'hEmRi7ezUX_HPQFcW5OlJ',
          message: 'This is a message to Closs Otto type of member',
        },
        amountSpentForYear: 0,
        amountToSpendToNextTier: 200000,
      },
    ],
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
