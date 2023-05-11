import { buildOrderForDisplay } from './buildOrderForDisplay';

describe('Prep order for display', () => {
  it('Given order standard order', () => {
    const {
      total,
      subtotal,
      itemsDiscountedAmount,
      totalDiscountedFromTotal,
      tax,
      shipping,
      membersDiscount,
    } = buildOrderForDisplay(standardOrder);

    expect(total).toEqual('89.50');
    expect(subtotal).toEqual('74.50');
    expect(itemsDiscountedAmount).toEqual(0);
    expect(totalDiscountedFromTotal).toEqual(0);
    expect(shipping).toEqual('15.00');
    expect(tax).toEqual('8.14');
    expect(membersDiscount).toEqual(0);
  });
  it('Given order is fully discounted', () => {
    const {
      total,
      subtotal,
      itemsDiscountedAmount,
      totalDiscountedFromTotal,
      tax,
      shipping,
      membersDiscount,
    } = buildOrderForDisplay(itemsAndOrderDiscountedOrder);

    expect(total).toEqual('37.30');
    expect(subtotal).toEqual('59.60');
    expect(itemsDiscountedAmount).toEqual('14.90');
    expect(totalDiscountedFromTotal).toEqual('37.30');
    expect(shipping).toEqual('15.00');
    expect(tax).toEqual('3.39');
    expect(membersDiscount).toEqual(0);
  });
  it('Given order is for a cc member', () => {
    const {
      total,
      subtotal,
      itemsDiscountedAmount,
      totalDiscountedFromTotal,
      membersDiscount,
      tax,
      shipping,
    } = buildOrderForDisplay(memberOrder);

    expect(total).toEqual('55.88');
    expect(subtotal).toEqual('74.50');
    expect(itemsDiscountedAmount).toEqual(0);
    expect(totalDiscountedFromTotal).toEqual(0);
    expect(shipping).toEqual('Complimentary');
    expect(tax).toEqual('5.08');
    expect(membersDiscount).toEqual('18.63');
  });
  it('Given order is for a cc member and item is discounted', () => {
    const {
      total,
      subtotal,
      itemsDiscountedAmount,
      totalDiscountedFromTotal,
      membersDiscount,
      tax,
      shipping,
    } = buildOrderForDisplay(membersOrderDiscountedItems);

    expect(total).toEqual('67.05');
    expect(subtotal).toEqual('67.05');
    expect(itemsDiscountedAmount).toEqual('7.45');
    expect(totalDiscountedFromTotal).toEqual(0);
    expect(shipping).toEqual('Complimentary');
    expect(tax).toEqual('6.10');
    expect(membersDiscount).toEqual(0);
  });
  it('Given order from jess legacyAccount', () => {
    const {
      total,
      subtotal,
      itemsDiscountedAmount,
      totalDiscountedFromTotal,
      membersDiscount,
      tax,
      shipping,
    } = buildOrderForDisplay(legacyJessOrder);

    expect(total).toEqual('202.75');
    expect(subtotal).toEqual('405.50');
    expect(itemsDiscountedAmount).toEqual(0);
    expect(totalDiscountedFromTotal).toEqual(0);
    expect(shipping).toEqual('Complimentary');
    expect(tax).toEqual('18.43');
    expect(membersDiscount).toEqual('202.75');
  });
  it('Given order from client legacyAccount', () => {
    const {
      total,
      subtotal,
      itemsDiscountedAmount,
      totalDiscountedFromTotal,
      membersDiscount,
      tax,
      shipping,
    } = buildOrderForDisplay(clientLegacyOrder);

    expect(total).toEqual('690.00');
    expect(subtotal).toEqual('920.00');
    expect(itemsDiscountedAmount).toEqual(0);
    expect(totalDiscountedFromTotal).toEqual(0);
    expect(shipping).toEqual('Complimentary');
    expect(tax).toEqual('62.73');
    expect(membersDiscount).toEqual('230.00');
  });
  it('Given order from CC with shipping selected', () => {
    const {
      total,
      subtotal,
      itemsDiscountedAmount,
      totalDiscountedFromTotal,
      membersDiscount,
      tax,
      shipping,
    } = buildOrderForDisplay(orderShipping);

    expect(total).toEqual('10800.00');
    expect(subtotal).toEqual('12000.00');
    expect(itemsDiscountedAmount).toEqual('3000.00');
    expect(totalDiscountedFromTotal).toEqual('1200.00');
    expect(shipping).toEqual('Complimentary');
    expect(tax).toEqual('981.82');
    expect(membersDiscount).toEqual(0);
  });
});

const standardOrder = {
  _id: 'test',
  items: [
    {
      _id: 'testProductItem',
      productId: 'testProduct',
      quantity: 1,
      purchasedPrice: 7450,
      originalPrice: 7450,
    },
  ],
  orderNumber: '300153',
  payment: {
    status: 'paid',
    type: 'cash',
    amount: 8950,
    subTotal: 7450,
    memberTotalDiscount: 0,
    memberShippingDiscount: 0,
    shippingCost: {
      price: 1500,
      allowCheckout: true,
      message: null,
      type: 'aus_metro',
    },
    originalTotal: 8950,
    originalSubTotal: 7450,
    overrideTotalPrice: null,
    discountApplied: 0,
  },
  checkoutStatus: '"paid"',
};

const itemsAndOrderDiscountedOrder = {
  _id: '8uzlhie3hr9',

  items: [
    {
      _id: '8uzlhie3hra',
      productId: 'vlb619yws',
      quantity: 1,
      overidedPrice: 5960,
      purchasedPrice: 5960,
      originalPrice: 7450,
    },
  ],
  orderNumber: 300155,

  overrides: {
    total: 3729.9999999999995,
  },
  payment: {
    status: 'paid',
    type: 'cash',
    amount: 3729.9999999999995,
    subTotal: 3729.9999999999995,
    memberTotalDiscount: 0,
    memberShippingDiscount: 0,
    shippingCost: {
      price: 1500,
      allowCheckout: true,
      message: null,
      type: 'aus_metro',
    },
    originalTotal: 7460,
    originalSubTotal: 5960,
    overrideTotalPrice: 3729.9999999999995,
    discountApplied: 5220,
  },
};

const memberOrder = {
  _id: 'memberOrder',
  items: [
    {
      _id: 'memberOrderItemId',
      productId: 'vlb619yws',
      quantity: 1,
      purchasedPrice: 7450,
      originalPrice: 7450,
    },
  ],
  orderNumber: 300156,
  payment: {
    status: 'paid',
    amount: 5587.5,
    subTotal: 7450,
    memberTotalDiscount: 1862.5,
    memberShippingDiscount: 1500,
    shippingCost: {
      price: 1500,
      allowCheckout: true,
      message: null,
      type: 'aus_metro',
    },
    originalTotal: 5587.5,
    overrideTotalPrice: null,
    discountApplied: 1862.5,
    originalSubTotal: 7450,
    type: 'card',
  },
};

const membersOrderDiscountedItems = {
  _id: '8uzlhif6czy',
  checkoutStatus: 'paid',
  items: [
    {
      _id: '8uzlhif6czz',
      productId: 'vlb619yws',
      quantity: 1,
      overidedPrice: 6705,
      purchasedPrice: 6705,
      originalPrice: 7450,
    },
  ],
  orderNumber: 300157,
  shipping: {
    pickup: false,
  },
  payment: {
    status: 'paid',
    amount: 6705,
    subTotal: 6705,
    memberTotalDiscount: 0,
    memberShippingDiscount: 1500,
    shippingCost: {
      price: 1500,
      allowCheckout: true,
      message: null,
      type: 'aus_metro',
    },
    originalTotal: 6705,
    overrideTotalPrice: null,
    discountApplied: 745,
    originalSubTotal: 6705,

    type: 'card',
  },
};

const legacyJessOrder = {
  _id: '644a9aa159b246173be4d69e',
  checkoutStatus: 'paid',
  items: [
    {
      _id: '644a9aa159b246173be4d69f',

      productName: 'Blanc de Noir Sparkling White',
      legacyProductId: '167834',
      isActive: false,
      productId: 'vlb5yvezk',
      quantity: 6,
      purchasedPrice: 2850,
      originalPrice: 2850,
    },
    {
      _id: '644a9aa159b246173be4d6a2',
      productName: 'Eden Valley Riesling',
      legacyProductId: '168604',
      isActive: false,
      productId: 'vlb0a0prb',
      quantity: 6,
      purchasedPrice: 2750,
      originalPrice: 2750,
    },
    {
      _id: '644a9aa159b246173be4d6a3',
      product: {
        _id: '63e7381e021823b2ab639a1d',
        domainId: 'vl8z483o6',
        name: '2020 The Beauty Shiraz',
        productCode: 'BTY20-CORK',
        description: '2020 The Beauty Shiraz',
        price: 6318,
        isActive: false,
        customFields: {},
        forSaleOnPos: false,
        forSaleOnWebsite: false,
      },
      productName: 'The Beauty Shiraz',
      legacyProductId: '165330',
      isActive: false,
      productId: '63e7381e021823b2ab639a1d',
      quantity: 1,
      purchasedPrice: 6950,
      originalPrice: 6950,
    },
  ],
  legacyMemberId: '48796',
  legacyOrder: true,
  orderNumber: '174944',
  payment: {
    _id: '644a9aa159b246173be4d69d',
    memberId: '64491a2dace6ec560b43384a',
    status: 'paid',
    subTotal: 40550,
    tax: 3686.3599999999997,
    date: {
      $date: '2023-02-09T02:34:02.000Z',
    },
    amount: 20275,
    discountApplied: 20275,
    memberTotalDiscount: 20275,
    type: 'legacy',
  },
  shipping: {
    shippingCost: 0,
    status: 'delivered',
  },
};

const clientLegacyOrder = {
  _id: '644a9aa159b246173be50b09',
  checkoutStatus: 'paid',
  items: [
    {
      _id: '644a9aa159b246173be50b0a',

      productName: 'Clos Otto Shiraz',
      legacyProductId: '174931',
      isActive: false,
      productId: 'ulgx2145v',
      quantity: 2,
      purchasedPrice: 26000,
      originalPrice: 26000,
    },
    {
      _id: '644a9aa159b246173be50b0d',
      product: {
        _id: '644a9aa159b246173be4dbec',
        domainId: 'vl8z483o6',
        name: 'H-Block Shiraz Cabernet Sauvignon',
        legacyProduct: true,
        productCode: 'HBS20',
        description: 'H-Block Shiraz Cabernet Sauvignon',
        price: 60000,
        isActive: false,
        customFields: {},
        forSaleOnPos: false,
        forSaleOnWebsite: false,
      },
      productName: 'H-Block Shiraz Cabernet Sauvignon',
      legacyProductId: '175061',
      isActive: false,
      productId: '644a9aa159b246173be4dbec',
      quantity: 2,
      purchasedPrice: 20000,
      originalPrice: 20000,
    },
  ],
  orderNumber: '176151',
  payment: {
    _id: '644a9aa159b246173be50b08',
    memberId: '6448f2f7ace6ec560b415953',
    status: 'paid',
    subTotal: 92000,
    tax: 8363.64,
    amount: 69000,
    discountApplied: 23000,
    memberTotalDiscount: 23000,
    type: 'legacy',
  },
  shipping: {
    _id: '644a9aa159b246173be50b07',
    shippingCost: 0,
  },
};

const orderShipping = {
  _id: 'm4slhigpdv7',
  checkoutStatus: 'paid',

  items: [
    {
      productId: '644a9f06742cca79e8b4cb9a',
      quantity: 1,
      _id: 'm4slhigph1u',
      overidedPrice: 1200000,
      purchasedPrice: 1200000,
      originalPrice: 1500000,
    },
  ],
  orderNumber: 300158,
  overrides: {
    total: 1080000,
  },
  fromPos: true,
  shipping: {
    pickup: false,
    shippingCost: {
      price: 0,
      allowCheckout: true,
      message: null,
      type: 'aus_metro',
    },
  },
  payment: {
    status: 'paid',
    amount: 1080000,
    subTotal: 1080000,
    memberTotalDiscount: 0,
    memberShippingDiscount: 0,
    shippingCost: {
      price: 0,
      allowCheckout: true,
      message: null,
      type: 'aus_metro',
    },
    originalTotal: 1200000,
    overrideTotalPrice: 1080000,
    discountApplied: 420000,
    originalSubTotal: 1200000,

    type: 'card',
  },
};
