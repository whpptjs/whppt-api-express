import { ContextType } from 'src/context/Context';
import { Order } from 'src/modules/order/Models/Order';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

export type LoadOrderWithProductsArgs = (
  context: ContextType,
  orderId: string
) => Promise<Order>;

export const loadOrderWithProducts: LoadOrderWithProductsArgs = (
  { $database },
  orderId
) => {
  return $database.then(database => {
    const { db } = database as WhpptMongoDatabase;

    return db
      .collection<Order>('orders')
      .aggregate([
        {
          $match: { _id: orderId },
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
                quantity: '$items.quantity',
                product: {
                  _id: '$items.product._id',
                  name: '$items.product.name',
                  image: '$items.product.image',
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
          },
        },
      ])
      .toArray()
      .then(orders => {
        return (orders[0] as Order) || ({} as Order);
      });
  });
};
