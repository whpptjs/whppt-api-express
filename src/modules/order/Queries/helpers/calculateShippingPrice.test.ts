import { OrderItemWithProduct } from '../../Models/Order';
import { calculateShippingPrice } from './calculateShippingPrice';

describe('Calculate shipping cost', () => {
  const args1 = {
    items: [
      {
        quantity: 1,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'pack',
            packItems: [
              {
                _id: 'vlb610hom',
                name: '25th Anniversary Shiraz',
                productCode: 'ANN21',
                qty: 4,
              },
              {
                _id: 'ulc8lz84n',
                name: '2016 HF The Creation Shiraz - Museum',
                productCode: 'CRE16-MUS',
                qty: 5,
              },
              {
                _id: 'ulc8lz84n',
                name: '2016 HF The Creation Shiraz - Museum',
                productCode: 'CRE16-MUS',
                qty: 4,
              },
            ],
          },
        },
      },
    ],
  };
  const price1 = 15;

  it('Given one pack, 1 item, 3 packed items', () => {
    const price = calculateShippingPrice(
      args1.items as unknown as OrderItemWithProduct[],
      price1
    );

    expect(price).toEqual(30);
  });

  const args2 = {
    items: [
      {
        quantity: 9,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 3,
          },
        },
      },
    ],
  };
  const price2 = 15;

  it('Given 1 item, qty 9 in cart, qtyOfItemsInProduct 3', () => {
    const price = calculateShippingPrice(
      args2.items as unknown as OrderItemWithProduct[],
      price2
    );

    expect(price).toEqual(45);
  });

  const args3 = {
    items: [
      {
        quantity: 9,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 3,
          },
          freeDelivery: true,
        },
      },
    ],
  };
  const price3 = 15;

  it('Given 1 items with FREE SHIPPING, qty 9, qtyOfItemsInProduct 3', () => {
    const price = calculateShippingPrice(
      args3.items as unknown as OrderItemWithProduct[],
      price3
    );

    expect(price).toEqual(0);
  });

  const args4 = {
    items: [
      {
        quantity: 1,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'pack',
            packItems: [
              {
                _id: 'vlb610hom',
                name: '25th Anniversary Shiraz',
                productCode: 'ANN21',
                qty: 4,
              },
              {
                _id: 'ulc8lz84n',
                name: '2016 HF The Creation Shiraz - Museum',
                productCode: 'CRE16-MUS',
                qty: 5,
              },
              {
                _id: 'ulc8lz84n',
                name: '2016 HF The Creation Shiraz - Museum',
                productCode: 'CRE16-MUS',
                qty: 4,
              },
            ],
          },
        },
      },
      {
        quantity: 2,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 3,
          },
          freeDelivery: false,
        },
      },
    ],
  };
  const price4 = 15;

  it('Given 2 items: first one with pack, qty 1, 4 items free shipping, 5 items and 4 items; second one qty 2, no pack, items in product 3', () => {
    const price = calculateShippingPrice(
      args4.items as unknown as OrderItemWithProduct[],
      price4
    );

    expect(price).toEqual(30);
  });

  const args5 = {
    items: [
      {
        quantity: 1,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'pack',
            packItems: [
              {
                _id: 'vlb610hom',
                name: '25th Anniversary Shiraz',
                productCode: 'ANN21',
                qty: 3,
              },
              {
                _id: 'ulc8lz84n',
                name: '2016 HF The Creation Shiraz - Museum',
                productCode: 'CRE16-MUS',
                qty: 15,
              },
              {
                _id: 'ulc8lz84n',
                name: '2016 HF The Creation Shiraz - Museum',
                productCode: 'CRE16-MUS',
                qty: 24,
              },
            ],
          },
        },
      },
      {
        quantity: 1,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 43,
          },
        },
      },
      {
        quantity: 2,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 3,
          },
        },
        freeDelivery: true,
      },
      {
        quantity: 4,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 53,
          },
        },
      },
      {
        quantity: 4,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 36,
          },
        },
      },
      {
        quantity: 1,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 1,
          },
        },
      },
      {
        quantity: 20,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 9,
          },
        },
      },
      {
        quantity: 24,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 12,
          },
        },
      },
      {
        quantity: 7,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 3,
          },
        },
      },
      {
        quantity: 6,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 11,
          },
        },
      },
      {
        quantity: 3,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 10,
          },
        },
      },
      {
        quantity: 4,
        product: {
          customFields: {
            quantityUnitOfMeasure: 'item',
            qtyOfItemsInProduct: 3,
          },
        },
      },
    ],
  };
  const price5 = 15;

  it('Given 12 items in cart: 1 pack (3,15,24), rest are items', () => {
    const price = calculateShippingPrice(
      args5.items as unknown as OrderItemWithProduct[],
      price5
    );

    expect(price).toEqual(1320);
  });
});
