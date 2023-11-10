import { calcShipingCost } from './calcPrice';
import { delivery } from './deliveryMock';

describe('Calculate shipping cost', () => {
  it('if from NZ', () => {
    const { items } = testOrder;
    const { price, allowCheckout, message, type } = calcShipingCost({
      postcode: '7614',
      country: 'NZ',
      pickup: false,
      items,
      delivery,
    });

    expect(price).toEqual(0);
    expect(allowCheckout).toEqual(false);
    expect(message).toEqual('Someone will contact you.');
    expect(type).toEqual('international');
  });
  it('if from AU', () => {
    const { items } = testOrder;
    const { price, allowCheckout, message, type } = calcShipingCost({
      postcode: '7614',
      country: 'AU',
      pickup: false,
      items,
      delivery,
    });

    expect(price).toEqual(2000);
    expect(allowCheckout).toEqual(true);
    expect(message).toEqual(undefined);
    expect(type).toEqual('aus_regional');
  });
});

const testOrder = {
  checkoutStatus: 'paid',
  contact: {
    _id: 'vs7lg4n3yms',
    email: 'leandro+ct@sveltestudios.com',
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
      postCode: '2105',
    },
    pickup: false,
  },
};
