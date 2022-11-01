import assert from 'assert';
import { ContextType } from 'src/context/Context';
import { OrderWithProducts } from 'src/modules/order/Models/Order';
import type { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

export type LoadOrderWithProductsArgs = (
  context: ContextType,
  matchQuery: any
) => Promise<OrderWithProducts>;

export const loadOrderWithProducts: LoadOrderWithProductsArgs = (
  { $database },
  matchQuery
) => {
  return $database.then(database => {
    assert(matchQuery, 'Match Query Required.');
    const { db } = database as WhpptMongoDatabase;

    return db
      .collection('orders')
      .aggregate<OrderWithProducts>([
        {
          $match: matchQuery,
        },
        {
          $limit: 1,
        },
        {
          $unwind: {
            path: '$items',
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'items.product',
          },
        },
        {
          $unwind: {
            path: '$items.product',
          },
        },
        {
          $group: {
            _id: '$_id',
            items: {
              $push: {
                id: '$items._id',
                productId: '$items.productId',
                quantity: '$items.quantity',
                purchasedPrice: '$items.purchasedPrice',
                product: {
                  _id: '$items.product._id',
                  name: '$items.product.name',
                  images: '$items.product.images',
                  featureImageId: '$items.product.featureImageId',
                  customFields: '$items.product.customFields',
                  quantityAvailable: '$items.product.quantityAvailable',
                  vintage: '$items.product.vintage',
                  stockKeepingUnit: '$items.product.stockKeepingUnit',
                  price: '$items.product.price',
                },
              },
            },
            domainId: { $first: '$domainId' },
            contact: { $first: '$contact' },
            billingAddress: { $first: '$billingAddress' },
            shippingAddress: { $first: '$shippingAddress' },
            contactId: { $first: '$contactId' },
            discountIds: { $first: '$discountIds' },
            shipping: { $first: '$shipping' },
            checkoutStatus: { $first: '$checkoutStatus' },
            payment: { $first: '$payment' },
            stripe: { $first: '$stripe' },
            updatedAt: { $first: '$updatedAt' },
          },
        },
      ])
      .toArray()
      .then(orders => {
        const order = orders[0];

        if (!order) return Promise.reject({ status: 404, message: 'Order Not Found.' });

        return order;
      });
  });
};
