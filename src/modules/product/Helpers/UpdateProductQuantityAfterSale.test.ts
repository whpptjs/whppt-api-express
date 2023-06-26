import { ContextType } from './../../../context/Context';
import { updateProductQuantityAfterSale } from './UpdateProductQuantityAfterSale';

describe('Decrease quantity of items available in stock', () => {
  it('Result must be the product quantity minus the quantity on the order for that item', async () => {
    const context = {
      $database: Promise.resolve({
        document: {
          saveWithEvents: jest
            .fn()
            .mockImplementation((_, updatedProduct, __, ___) =>
              Promise.resolve(updatedProduct)
            ),
        },
        startTransaction: jest.fn(callback => callback({})),
        queryDocuments: jest.fn().mockImplementation((_, query) => {
          const productIds = query.filter._id.$in;
          const products = productsCollectionMock.filter(product =>
            productIds.includes(product._id)
          );
          return Promise.resolve(products);
        }),
      }),
      createEvent: jest.fn().mockReturnValue({}),
    } as unknown as ContextType;

    await updateProductQuantityAfterSale(context, order.items);

    order.items.forEach(item => {
      const product = productsCollectionMock.find(p => p._id === item.productId);
      if (product) {
        const expectedQuantity = Number(product.quantityAvailable);

        context.$database.then(database => {
          expect(database.document.fetch).toHaveBeenCalledWith(
            'products',
            item.productId
          );
          expect(context.createEvent).toHaveBeenCalledWith(
            'ProductQuantityDecreasedAfterSale',
            expect.objectContaining({
              quantityAvailable: expectedQuantity.toString(),
            })
          );
          expect(database.document.saveWithEvents).toHaveBeenCalledWith(
            'products',
            expect.objectContaining({
              quantityAvailable: expectedQuantity.toString(),
            }),
            [{}],
            { session: {} }
          );
        });
      }
    });
  });
});

const product1 = {
  _id: 'vlb619yws',
  config: {
    unleashed: {
      _id: 'cf304b32-88f0-4150-bed9-85febf67b1a2',
      overrideProductCode: true,
      overrideProductName: true,
      overrideProductIsActive: true,
      overrideProductFamily: true,
    },
  },
  createdAt: {
    $date: '2022-12-02T04:56:33.532Z',
  },
  customFields: {
    quantityUnitOfMeasure: 'bottle',
    varietal: 'Sparkling',
    vintage: 'NV',
    bottleSize: '750ml',
    subjectToWineTax: true,
    detailedDescription:
      '<p>Sparkling Shiraz is a traditional Barossa indulgence, and our Seppeltsfield vineyard is the perfect fruit source to produce this homage to the style; rich in flavour with a delightful air of elegance.</p>',
    vintages: [],
    additionalInformation: [
      {
        text: '<p>Eastern-Blocks: Deep red clay loam | Low topographical position | Shaded Morning | North-south oriented rows<br>Upshot: Ripe yet elegant fruit | Soft tannins | Lifted aromatics</p>',
        title: 'Vineyard',
        _id: 'CvDDQEdpSgiK0ynSJcyAu',
      },
      {
        text: '<p>Primary Fermentation: De-stemmed | Basket pressed with soft extraction<br>Oak: French – 35% new, 65% seasoned | Natural malolactic fermentation | 24 months average maturation<br>Secondary Fermentation: In bottle | Traditional method | 12 months on lees<br>Technical Analysis: Alcohol – 14.0% | pH – 3.51 | Acid – 6.6g/L | RS – 15g/L</p><p></p><p style="text-align: start">Noteworthy Dates<br>Disgorged: October 2022 | Released: November 2022</p>',
        title: 'Winemaking',
        _id: 'Z6a-h_bZmzzGyRUqKDf1R',
      },
      {
        text: '<p>Sensorial<br>Profile: Blackberry | Mulberry | Cinnamon Quill | Freshly Baked Brioche | Star Anise<br>Texture: Fine, even bead | Soft tannins | Balanced acidity | Dry finish</p><p></p><p style="text-align: start">Animal/Vehicle/Musical<br>Animal – Red-bellied Black Snake<br>Vehicle – Ferrari F8 Spider<br>Musical – Timpani</p>',
        title: 'Profile',
        _id: 'DVNTWMz5q7MW6yQw-oyz4',
      },
    ],
    qtyOfItemsInProduct: '',
    packItems: [],
  },
  domainId: 'vl8z483o6',
  images: [
    {
      desktop: {
        galleryItemId: 'vlb61i0a6',
        aspectRatio: {
          label: 'locked',
          ratio: {
            w: 21,
            h: 9,
          },
        },
        orientation: 'portrait',
        altText: '',
        caption: '',
      },
      _id: 'vlb61ihzq',
    },
  ],
  isActive: true,
  name: 'Black Beauty Sparkling Shiraz (2022 disgorged)',
  productCode: 'SPA22',
  updatedAt: {
    $date: '2023-06-06T06:55:36.436Z',
  },
  family: 'luxury',
  membersSaleOptions: {
    '7MYh2mUTrwO12g4rC3Xez': {
      _id: '7MYh2mUTrwO12g4rC3Xez',
      name: 'Friends of the Farm - FF (Complimentary)',
      canBuy: true,
      maxQuantity: 0,
    },
    '82GWdv2CbRMMR_745Pxqc': {
      _id: '82GWdv2CbRMMR_745Pxqc',
      name: 'Tally Room Member - TR',
      canBuy: true,
      maxQuantity: 0,
    },
    '29lRIFebMkUQgvHY72zyp': {
      _id: '29lRIFebMkUQgvHY72zyp',
      name: 'Clos Otto Club Member - CC',
      canBuy: true,
      maxQuantity: 0,
    },
  },
  user: {
    _id: '63c08d7ebafddf3ec1255cb0',
    username: 'leo',
    roles: [],
    isGuest: false,
  },
  canPlaceOrderQuantity: '0',
  description:
    'Sparkling Shiraz is a traditional Barossa indulgence, and our Seppeltsfield vineyard is the perfect fruit source to produce this homage to the style; rich in flavour with a delightful air of elegance.',
  forSaleOnPos: true,
  forSaleOnWebsite: true,
  price: 7450,
  quantityAvailable: '100',
  unitOfMeasure: '',
  featureImageId: 'vlb61ihzq',
  slug: 'wine/black-beauty-sparkling-shiraz-2022-disgorged',
  vintage: 'NV',
};

const product2 = {
  _id: 'ulca252uw',
  config: {
    unleashed: {
      _id: '59e220f5-1f7c-4d4c-a23d-97f47d12ddad',
      overrideProductCode: true,
      overrideProductName: true,
      overrideProductIsActive: true,
      overrideProductFamily: true,
    },
  },
  createdAt: {
    $date: '2022-12-30T05:11:32.024Z',
  },
  customFields: {
    vintage: '2010',
    varietal: 'Sparkling',
    bottleSize: '750ml',
    quantityUnitOfMeasure: 'bottle',
  },
  domainId: 'vl8z483o6',
  images: [],
  isActive: true,
  name: 'Black Beauty Sparkling Shiraz',
  productCode: 'SPA10-MUS',
  updatedAt: {
    $date: '2023-06-06T06:55:36.437Z',
  },
  family: 'luxury',
  membersSaleOptions: {
    closOtto: {
      canBuy: true,
    },
    tallyRoom: {
      canBuy: true,
    },
    friends: {
      canBuy: true,
    },
    guest: {
      canBuy: true,
    },
  },
  user: {
    _id: '634c975b45a249d349538acd',
    username: 'jess',
    roles: [],
    isGuest: false,
  },
  canPlaceOrderQuantity: '0',
  description: '',
  forSaleOnPos: true,
  price: 15000,
  quantityAvailable: '10',
  unitOfMeasure: '',
};

const product3 = {
  _id: 'ulca26lsq',
  config: {
    unleashed: {
      _id: 'ea14f502-81cf-4a59-b204-689310866eb3',
      overrideProductCode: true,
      overrideProductName: true,
      overrideProductIsActive: true,
      overrideProductFamily: true,
    },
  },
  createdAt: {
    $date: '2022-12-30T05:12:43.226Z',
  },
  customFields: {
    quantityUnitOfMeasure: 'bottle',
    varietal: 'Sparkling',
    vintage: '2017',
    bottleSize: '750ml',
    subjectToWineTax: true,
    detailedDescription: '',
    vintages: [],
    additionalInformation: [],
    qtyOfItemsInProduct: '',
    packItems: [],
  },
  domainId: 'vl8z483o6',
  images: [],
  isActive: true,
  name: 'Black Beauty Sparkling Shiraz (2017 disgorged)',
  productCode: 'SPA17-MUS',
  updatedAt: {
    $date: '2023-06-06T06:55:36.438Z',
  },
  family: 'luxury',
  membersSaleOptions: {
    '7MYh2mUTrwO12g4rC3Xez': {
      _id: '7MYh2mUTrwO12g4rC3Xez',
      name: 'Friends of the Farm - FF (Complimentary)',
      canBuy: true,
      maxQuantity: 0,
    },
    '82GWdv2CbRMMR_745Pxqc': {
      _id: '82GWdv2CbRMMR_745Pxqc',
      name: 'Tally Room Member - TR',
      canBuy: true,
      maxQuantity: 0,
    },
    '29lRIFebMkUQgvHY72zyp': {
      _id: '29lRIFebMkUQgvHY72zyp',
      name: 'Clos Otto Club Member - CC',
      canBuy: true,
      maxQuantity: 0,
    },
  },
  user: {
    _id: '634c975b45a249d349538acd',
    username: 'jess',
    roles: [],
    isGuest: false,
  },
  canPlaceOrderQuantity: '0',
  description: '',
  forSaleOnPos: true,
  price: 13100,
  quantityAvailable: '20',
  unitOfMeasure: '',
  vintage: '2017',
};

const productsCollectionMock = [product1, product2, product3];

const order = {
  _id: 'ihglijxarb7',
  checkoutStatus: 'paid',
  createdAt: {
    $date: '2023-06-06T06:51:54.697Z',
  },
  items: [
    {
      _id: 'ihglijxarb8',
      productId: 'vlb619yws',
      quantity: 10,
      purchasedPrice: 7450,
      originalPrice: 7450,
    },
    {
      productId: 'ulca252uw',
      quantity: 6,
      _id: 'ihglijxarss',
      purchasedPrice: 15000,
      originalPrice: 15000,
    },
    {
      productId: 'ulca26lsq',
      quantity: 4,
      _id: 'ihglijxas3g',
      purchasedPrice: 13100,
      originalPrice: 13100,
    },
  ],
  orderNumber: 300651,
  updatedAt: {
    $date: '2023-06-06T06:55:36.425Z',
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
      number: '',
      street: '',
      suburb: '',
      city: '',
      state: '',
      country: '',
      postCode: '',
    },
    pickup: true,
    shippingCost: {
      price: 0,
      allowCheckout: true,
      message: '',
      type: 'pickup',
    },
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
  },
  isDiner: false,
  ageConfirmed: true,
  payment: {
    status: 'paid',
    amount: 216900,
    subTotal: 216900,
    memberTotalDiscount: 0,
    memberShippingDiscount: 0,
    shippingCost: {
      price: 0,
      allowCheckout: true,
      message: '',
      type: 'pickup',
    },
    originalTotal: 216900,
    overrideTotalPrice: null,
    discountApplied: 0,
    originalSubTotal: 216900,
    date: {
      $date: '2023-06-06T06:55:36.424Z',
    },
    type: 'card',
  },
  stripe: {
    intentId: 'pi_3NFtnmLi5iu0zliS2DATImZs',
    status: 'paid',
    amount: 216900,
    date: {
      $date: '2023-06-06T06:55:36.424Z',
    },
  },
};
