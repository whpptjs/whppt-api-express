import { OrderWithProducts } from '../Models/Order';
import { addUnitDiscountsToOrder } from './AddUnitDiscounts';

describe('Prep order for discounts', () => {
  it('Given an order with no discounts', () => {
    const order = addUnitDiscountsToOrder(standardOrder);
    const item = order.items[0];
    expect(item.originalPrice).toEqual(7450);
    expect(item.quantity).toEqual(1);
    expect(item.totalDiscountApplied).toEqual(0);
    expect(item.revenue).toEqual(7450);
    expect(item.shippingCostPrice).toEqual(400);
    expect(order.fromPos).toEqual(true);
    expect(order.isDiner).toEqual(false);
    expect(order.shipping?.pickup).toEqual(true);
  });
  it('Given order with a total discount', () => {
    const order = addUnitDiscountsToOrder(overridedTotal);
    const item = order.items[0];
    expect(item.originalPrice).toEqual(9450);
    expect(item.quantity).toEqual(6);
    expect(item.totalDiscountApplied).toEqual(11.816578483245166);
    expect(item.shippingCostPrice).toEqual(2250);
    expect(item.revenue).toEqual(49999.99999999999);
    expect(order.fromPos).toEqual(true);
    expect(order.isDiner).toEqual(false);
    expect(order.shipping?.pickup).toEqual(true);
  });
  it('Given order with a item discount', () => {
    const order = addUnitDiscountsToOrder(overridedItem);
    const item = order.items[0];
    expect(item.originalPrice).toEqual(9450);
    expect(item.quantity).toEqual(1);
    expect(item.shippingCostPrice).toEqual(300);
    expect(item.totalDiscountApplied).toEqual(20.000000000000007);
    expect(item.revenue).toEqual(7559.999999999999);
    expect(order.fromPos).toEqual(false);
    expect(order.isDiner).toEqual(true);
    expect(order.shipping?.pickup).toEqual(false);
  });
  it('Given order with a member discount', () => {
    const order = addUnitDiscountsToOrder(memerDiscount);
    const item = order.items[0];
    expect(item.originalPrice).toEqual(7450);
    expect(item.quantity).toEqual(2);
    expect(item.shippingCostPrice).toEqual(0);
    expect(item.totalDiscountApplied).toEqual(10);
    expect(item.revenue).toEqual(13410);
    expect(order.fromPos).toEqual(true);
    expect(order.isDiner).toEqual(false);
    expect(order.shipping?.pickup).toEqual(true);
  });
  it('Given order with a FRIEGHT', () => {
    const order = addUnitDiscountsToOrder(frieghtOrder);
    const items = order.items;
    expect(items[0].originalPrice).toEqual(3600);
    expect(items[0].quantity).toEqual(6);
    expect(items[0].shippingCostPrice).toEqual(0);
    expect(items[0].totalDiscountApplied).toEqual(25);
    expect(items[0].revenue).toEqual(16200);
    expect(items[1].originalPrice).toEqual(3250);
    expect(items[1].quantity).toEqual(18);
    expect(items[1].shippingCostPrice).toEqual(0);
    expect(items[1].totalDiscountApplied).toEqual(25);
    expect(items[1].revenue).toEqual(43875);
    expect(items[2].originalPrice).toEqual(6950);
    expect(items[2].quantity).toEqual(12);
    expect(items[2].shippingCostPrice).toEqual(0);
    expect(items[2].totalDiscountApplied).toEqual(25);
    expect(items[2].revenue).toEqual(62550);

    expect(items[3].originalPrice).toEqual(2750);
    expect(items[3].quantity).toEqual(24);
    expect(items[3].shippingCostPrice).toEqual(0);
    expect(items[3].totalDiscountApplied).toEqual(25);
    expect(items[3].revenue).toEqual(49500);

    expect(items[4].originalPrice).toEqual(0);
    expect(items[4].quantity).toEqual(1);
    expect(items[4].shippingCostPrice).toEqual(0);
    expect(items[4].totalDiscountApplied).toEqual(0);
    expect(items[4].revenue).toEqual(106500);
    expect(order.shipping?.pickup).toEqual(true);
  });
});

const standardOrder = {
  _id: 'test',
  fromPos: true,
  isDiner: false,
  shipping: { pickup: true },
  items: [
    {
      _id: 'testProductItem',
      productId: 'testProduct',
      quantity: 1,
      purchasedPrice: 7450,
      originalPrice: 7450,
    },
  ],
  orderNumber: 'standardOrder',
  payment: {
    status: 'paid',
    type: 'cash',
    amount: 8950,
    subTotal: 7450,
    memberTotalDiscount: 0,
    memberShippingDiscount: 1100,
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
  checkoutStatus: 'paid',
} as unknown as OrderWithProducts;

const overridedTotal = {
  _id: 'overridedTotal',
  checkoutStatus: 'paid',
  fromPos: true,
  isDiner: false,
  shipping: { pickup: true },
  items: [
    {
      _id: 'tlhlfb5lj',
      productId: 'vlb615hxc',
      quantity: 6,
      purchasedPrice: 9450,
      originalPrice: 9450,
    },
    {
      _id: 'ddd',
      productId: 'vlb615hxc',
      quantity: 2,
      purchasedPrice: 9450,
      originalPrice: 9450,
    },
  ],
  orderNumber: 3008297,
  payment: {
    status: 'paid',
    amount: 50000,
    subTotal: 50000,
    memberTotalDiscount: 0,
    memberShippingDiscount: 0,
    shippingCost: {
      price: 3000,
      allowCheckout: true,
      message: '',
      type: 'pickup',
      pickup: false,
    },
    originalTotal: 56700,
    overrideTotalPrice: 50000,
    discountApplied: 6700,
    originalSubTotal: 56700,
  },
  overrides: { total: 50000 },
} as unknown as OrderWithProducts;
const overridedItem = {
  _id: 'overridedItem',
  fromPos: false,
  isDiner: true,
  shipping: { pickup: false },
  items: [
    {
      _id: 'tlhlo3p69',
      productId: 'vlb615hxc',
      quantity: 1,
      overidedPrice: 7559.999999999999,
      purchasedPrice: 7559.999999999999,
      originalPrice: 9450,
    },
    {
      productId: 'ulgxmiopl',
      quantity: 4,
      _id: 'tlhlo3wrq',
      overidedPrice: 5560,
      purchasedPrice: 5560,
      originalPrice: 6950,
    },
  ],
  orderNumber: 3001927,
  payment: {
    status: 'paid',
    amount: 13120,
    subTotal: 13120,
    memberTotalDiscount: 0,
    memberShippingDiscount: 0,
    shippingCost: {
      price: 1500,
      allowCheckout: true,
      message: '',
      type: 'pickup',
      pickup: false,
    },
    originalTotal: 13120,
    overrideTotalPrice: null,
    discountApplied: 3280,
    originalSubTotal: 13120,
  },
} as unknown as OrderWithProducts;
const memerDiscount = {
  _id: 'memerDiscount',
  fromPos: true,
  isDiner: false,
  shipping: { pickup: true },
  items: [
    {
      productId: 'vlb619yws',
      quantity: 2,
      _id: 'tlhmxfq85',
      purchasedPrice: 7450,
      originalPrice: 7450,
    },
  ],
  orderNumber: 300949,
  payment: {
    status: 'paid',
    amount: 47310,
    subTotal: 50900,
    memberTotalDiscount: 5090,
    memberShippingDiscount: 0,
    originalTotal: 47310,
    overrideTotalPrice: null,
    discountApplied: 5090,
    originalSubTotal: 50900,
  },
} as unknown as OrderWithProducts;

const frieghtOrder = {
  _id: 'tloxmrov0',
  items: [
    {
      productId: 'ulkkh78yx',
      quantity: 6,
      _id: 'tloxpua55',
      overidedPrice: 2700,
      purchasedPrice: 2700,
      originalPrice: 3600,
    },
    {
      productId: '63e738d5021823b2ab63a390',
      quantity: 18,
      _id: 'tloxputwa',
      overidedPrice: 2437.5,
      purchasedPrice: 2437.5,
      originalPrice: 3250,
    },
    {
      productId: 'ulgxmiopl',
      quantity: 12,
      _id: 'tloxpv7m6',
      overidedPrice: 5212.5,
      purchasedPrice: 5212.5,
      originalPrice: 6950,
    },
    {
      productId: 'uln1adkee',
      quantity: 24,
      _id: 'tloxpvh61',
      overidedPrice: 2062.5,
      purchasedPrice: 2062.5,
      originalPrice: 2750,
    },
    {
      productId: 'ulbg2gbq7',
      quantity: 1,
      _id: 'tloxpw2nz',
      overidedPrice: 106500,
      purchasedPrice: 106500,
      originalPrice: 0,
    },
  ],
  orderNumber: 326646,
  shipping: {
    pickup: true,
    shippingCost: {
      price: 0,
      allowCheckout: true,
      message: '',
      type: 'pickup',
    },
  },
} as unknown as OrderWithProducts;
