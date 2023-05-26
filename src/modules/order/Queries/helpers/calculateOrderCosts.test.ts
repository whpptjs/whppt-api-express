import { calculateOrderCosts } from './calculateOrderCosts';
import assert from 'assert';

describe('Calculate membership tier', () => {
  it('Given I give a 10% discount override on total on a $305.00 order, for a FF member (member discount skipped)', () => {
    const shippingCost = tenPercentTotalDicountOverride.payment.shippingCost;
    const memberTier = {
      _id: '7MYh2mUTrwO12g4rC3Xez',
      name: 'Friends of the Farm - FF (Complimentary)',
      discounts: [
        {
          _id: 'er55oyn0KMNRvdAMX3K3-',
          appliedTo: 'total',
          type: 'percentage',
          value: 10,
          shipping: {},
          minItemsRequiredForDiscount: 6,
        },
      ],
      level: 1,
      entryLevelSpend: 0,
      messageToMembers: {
        link: {
          text: '',
          href: '/contact-test',
        },
        _id: '701emyWup0ta8p1SsuRO-',
        message: 'This is a message to Friends of the Farm type of member',
      },
    };

    const { total, subTotal, originalSubTotal, discountApplied, memberTotalDiscount } =
      calculateOrderCosts([
        shippingCost,
        memberTier as any,
        tenPercentTotalDicountOverride as any,
      ]);

    expect(subTotal / 100).toEqual(274.5);
    expect(originalSubTotal / 100).toEqual(305.0);
    expect(shippingCost.price / 100).toEqual(15.0);
    expect(discountApplied / 100).toEqual(30.5);
    expect(memberTotalDiscount).toEqual(0);
    expect(total / 100).toEqual(289.5);
  });

  it('Given I am a member with $1976 spent this year, and I spend $1830 on the current order', () => {
    const shippingCost = trToClossOtto.payment.shippingCost;

    const trTier = {
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
      discountAppliedForYear: 24400,
      amountSpentForYear: 197600,
      amountSpentWithDiscount: 197600,
      amountToSpendToNextTier: 2400,
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
          amountToSpendToNextTier: 2400,
        },
      ],
      lifetimeSpend: 197450,
    };

    const {
      total,
      subTotal,
      originalSubTotal,
      memberTotalDiscount,
      memberShippingDiscount,
      discountApplied,
    } = calculateOrderCosts([shippingCost as any, trTier as any, trToClossOtto as any]);

    expect(subTotal / 100).toEqual(1830.0);
    expect(originalSubTotal / 100).toEqual(1830.0);
    expect(memberTotalDiscount / 100).toBeCloseTo(456.0, 2);
    expect(memberShippingDiscount).toEqual(shippingCost.price); //Complimentary shipping
    expect(discountApplied).toEqual(memberTotalDiscount);
    expect(total / 100).toBeCloseTo(1374.0, 2);
  });

  it("Given I've overriden item price on an Item of $305 to $250, qty 4 items", () => {
    const shippingCost = ffItemOverride.payment.shippingCost;

    const memberTier = {
      _id: '7MYh2mUTrwO12g4rC3Xez',
      name: 'Friends of the Farm - FF (Complimentary)',
      discounts: [
        {
          _id: 'er55oyn0KMNRvdAMX3K3-',
          appliedTo: 'total',
          type: 'percentage',
          value: 10,
          shipping: {},
          minItemsRequiredForDiscount: 6,
        },
      ],
      level: 1,
      entryLevelSpend: 0,
      messageToMembers: {
        link: {
          text: '',
          href: '/contact-test',
        },
        _id: '701emyWup0ta8p1SsuRO-',
        message: 'This is a message to Friends of the Farm type of member',
      },
    };

    const {
      total,
      subTotal,
      originalSubTotal,
      memberTotalDiscount,
      memberShippingDiscount,
      discountApplied,
    } = calculateOrderCosts([
      shippingCost as any,
      memberTier as any,
      ffItemOverride as any,
    ]);

    expect(subTotal / 100).toEqual(1000.0);
    expect(originalSubTotal).toEqual(subTotal); //Discount applied on item price
    expect(memberTotalDiscount / 100).toEqual(0);
    expect(memberShippingDiscount).toEqual(0);
    expect(discountApplied / 100).toEqual(0);
    expect(total / 100).toEqual(1060.0);
  });

  it('Given the shipping does not allow for checkout', () => {
    const shippingCostObj = notAllowedToCheckout.payment.shippingCost;
    const memberTier = {
      _id: '7MYh2mUTrwO12g4rC3Xez',
      name: 'Friends of the Farm - FF (Complimentary)',
      discounts: [
        {
          _id: 'er55oyn0KMNRvdAMX3K3-',
          appliedTo: 'total',
          type: 'percentage',
          value: 10,
          shipping: {},
          minItemsRequiredForDiscount: 6,
        },
      ],
      level: 1,
      entryLevelSpend: 0,
      messageToMembers: {
        link: {
          text: '',
          href: '/contact-test',
        },
        _id: '701emyWup0ta8p1SsuRO-',
        message: 'This is a message to Friends of the Farm type of member',
      },
    };

    try {
      const { shippingCost } = calculateOrderCosts([
        shippingCostObj as any,
        memberTier as any,
        notAllowedToCheckout as any,
      ]);

      assert(shippingCost, undefined);
    } catch (err: any) {
      expect(err.message).toBe(shippingCostObj.message);
    }
  });
});

const tenPercentTotalDicountOverride = {
  _id: 'b54li3v8psk',
  checkoutStatus: 'paid',
  createdAt: {
    $date: '2023-05-26T01:10:01.365Z',
  },
  items: [
    {
      _id: 'b54li3v8psl',
      productId: 'ulc8lz84n',
      quantity: 1,
      purchasedPrice: 30500,
      originalPrice: 30500,
    },
  ],
  orderNumber: '300463',
  updatedAt: {
    $date: '2023-05-26T01:10:18.492Z',
  },
  overrides: {
    total: 27450,
  },
  fromPos: true,
  staff: {
    _id: '348lcr40ye6',
    username: null,
    marketArea: 'sales',
  },
  shipping: {
    contactDetails: {
      firstName: 'sdf',
      lastName: 'dsf',
      company: '',
    },
    address: {
      number: '33',
      street: 'Rose Ln',
      suburb: 'Melbourne',
      city: '',
      state: 'VIC',
      country: 'AU',
      postCode: '3000',
    },
    pickup: false,
  },
  note: '',
  contact: {
    _id: 'unknown_guest',
    createdAt: {
      $date: '2023-02-08T01:33:17.061Z',
    },
    firstName: 'Unknown',
    lastName: 'Guest',
    name: 'Unknown Guest',
    updatedAt: {
      $date: '2023-02-08T01:33:17.061Z',
    },
    email: '',
  },
  isDiner: false,
  payment: {
    status: 'paid',
    type: 'cash',
    date: {
      $date: '2023-05-26T01:10:18.492Z',
    },
    amount: 28950,
    subTotal: 27450,
    memberTotalDiscount: 0,
    memberShippingDiscount: 0,
    shippingCost: {
      price: 1500,
      allowCheckout: true,
      message: '',
      type: 'aus_metro' as 'aus_metro' | 'aus_regional' | 'international' | 'pickup',
    },
    originalTotal: 27450,
    originalSubTotal: 30500,
    overrideTotalPrice: 27450,
    discountApplied: 0,
  },
};

const trToClossOtto = {
  checkoutStatus: 'paid',
  contact: {
    _id: 'vs7lg4n3yms',
    email: 'leandro+ct@sveltestudios.com',
  },
  createdAt: {
    $date: '2023-05-26T03:37:21.308Z',
  },
  items: [
    {
      productId: 'ulc8lz84n',
      quantity: 6,
      _id: 'gucli40ich3',
      purchasedPrice: 30500,
      originalPrice: 30500,
    },
  ],
  memberId: 'vs7lg4nn4dl',
  orderNumber: 300469,
  updatedAt: {
    $date: '2023-05-26T04:29:29.113Z',
  },
  fromPos: true,
  staff: {
    _id: '348lcr40ye6',
    username: null,
    marketArea: 'sales',
  },
  shipping: {
    contactDetails: {
      firstName: '',
      lastName: '',
      company: '',
    },
    address: {
      number: '33',
      street: 'Rose Ln',
      suburb: 'Melbourne',
      city: '',
      state: 'VIC',
      country: 'AU',
      postCode: '3000',
    },
    pickup: false,
  },
  note: '',
  isDiner: false,
  payment: {
    status: 'paid',
    type: 'cash',
    date: {
      $date: '2023-05-26T04:29:29.113Z',
    },
    amount: 137399.95,
    subTotal: 183000,
    memberTotalDiscount: 45600.05,
    memberShippingDiscount: 9000,
    shippingCost: {
      price: 9000,
      allowCheckout: true,
      message: null,
      type: 'aus_metro',
    },
    originalTotal: 137399.95,
    originalSubTotal: 183000,
    overrideTotalPrice: null,
    discountApplied: 45600.05,
  },
};

const ffItemOverride =
  /**
   * Paste one or more documents here
   */
  {
    checkoutStatus: 'paid',
    contact: {
      _id: 'vs7lg4n3yms',
      email: 'leandro+ct@sveltestudios.com',
    },
    createdAt: {
      $date: '2023-05-26T04:57:13.505Z',
    },
    items: [
      {
        productId: 'ulc8lz84n',
        quantity: 4,
        _id: 'gucli43d0fg',
        overidedPrice: 25000,
        purchasedPrice: 25000,
        originalPrice: 30500,
      },
    ],
    memberId: 'vs7lg4nn4dl',
    orderNumber: 300470,
    updatedAt: {
      $date: '2023-05-26T05:09:31.155Z',
    },
    fromPos: true,
    staff: {
      _id: '348lcr40ye6',
      username: null,
      marketArea: 'sales',
    },
    shipping: {
      contactDetails: null,
      address: {
        number: '33',
        street: 'Rose Ln',
        suburb: 'Melbourne',
        city: '',
        state: 'VIC',
        country: 'AU',
        postCode: '3000',
      },
      pickup: false,
    },
    note: '',
    isDiner: false,
    payment: {
      status: 'paid',
      type: 'cash',
      date: {
        $date: '2023-05-26T05:09:31.155Z',
      },
      amount: 100000,
      subTotal: 100000,
      memberTotalDiscount: 0,
      memberShippingDiscount: 6000,
      shippingCost: {
        price: 6000,
        allowCheckout: true,
        message: null,
        type: 'aus_metro',
      },
      originalTotal: 100000,
      originalSubTotal: 100000,
      overrideTotalPrice: null,
      discountApplied: 22000,
    },
  };

const notAllowedToCheckout =
  /**
   * Paste one or more documents here
   */
  {
    checkoutStatus: 'paid',
    contact: {
      _id: 'vs7lg4n3yms',
      email: 'leandro+ct@sveltestudios.com',
    },
    createdAt: {
      $date: '2023-05-26T04:57:13.505Z',
    },
    items: [
      {
        productId: 'ulc8lz84n',
        quantity: 4,
        _id: 'gucli43d0fg',
        overidedPrice: 25000,
        purchasedPrice: 25000,
        originalPrice: 30500,
      },
    ],
    memberId: 'vs7lg4nn4dl',
    orderNumber: 300470,
    updatedAt: {
      $date: '2023-05-26T05:09:31.155Z',
    },
    fromPos: true,
    staff: {
      _id: '348lcr40ye6',
      username: null,
      marketArea: 'sales',
    },
    shipping: {
      contactDetails: null,
      address: {
        number: '33',
        street: 'Rose Ln',
        suburb: 'Melbourne',
        city: '',
        state: 'VIC',
        country: 'AU',
        postCode: '12345678',
      },
      pickup: false,
    },
    note: '',
    isDiner: false,
    payment: {
      status: 'paid',
      type: 'cash',
      date: {
        $date: '2023-05-26T05:09:31.155Z',
      },
      amount: 100000,
      subTotal: 100000,
      memberTotalDiscount: 0,
      memberShippingDiscount: 6000,
      shippingCost: {
        price: 0,
        allowCheckout: false,
        message: 'International order',
        type: 'internaltional',
      },
      originalTotal: 100000,
      originalSubTotal: 100000,
      overrideTotalPrice: null,
      discountApplied: 22000,
    },
  };
