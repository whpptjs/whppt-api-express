import assert from 'assert';
import { ContextType } from '../../context/Context';
import { Order } from 'src/modules/order/Models/Order';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

export type CalculateTotalArgs = (
  context: ContextType,
  orderId: string
) => Promise<number>;
export type LoadOrderArgs = (context: ContextType, orderId: string) => Promise<Order>;
export type GetStripCustomerIdFromContactArgs = (
  context: ContextType,
  stripe: any,
  contactId: string | undefined
) => Promise<Order>;

export const calculateTotal: CalculateTotalArgs = (ctx, orderId) => {
  return loadOrderWithProducts(ctx, orderId).then(order => {
    const itemsCostInDollars =
      order && order.items.length
        ? order.items.reduce(
            (acc: number, item) =>
              acc + Number(item.product?.price) * Number(item.quantity),
            0
          )
        : 0;
    const itemsCostInCents = itemsCostInDollars * 1000;
    const postageCost = order?.shipping?.shippingCost || 0;
    const postageCostInCents = postageCost * 1000;

    return itemsCostInCents + postageCostInCents;
  });
};

export const loadOrder: LoadOrderArgs = ({ $database }, orderId) => {
  return $database.then(database => {
    const { document } = database;
    return document.fetch('orders', orderId);
  });
};

export const loadOrderWithProducts: LoadOrderArgs = ({ $database }, orderId) => {
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
            contactRecord: { $first: '$contactRecord' },
            billingAddress: { $first: '$billingAddress' },
            shippingAddress: { $first: '$shippingAddress' },
            contactId: { $first: '$contactId' },
            discountIds: { $first: '$discountIds' },
            shipping: { $first: '$shipping' },
            orderStatus: { $first: '$orderStatus' },
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

export const getStripCustomerIdFromContact: GetStripCustomerIdFromContactArgs = (
  { $database },
  stripe,
  contactId
) => {
  if (!contactId) return Promise.resolve();
  return $database.then(database => {
    const { document } = database;

    return document.fetch('contacts', contactId).then(contact => {
      assert(contact, 'Contact Not Found.');
      if (contact.stripeCustomerId) return contact.stripeCustomerId;
      const name = `${contact.firstName} ${contact.lastName}`;
      return stripe.customers.create({ name }).then((customer: any) => {
        contact.stripeCustomerId = customer.id;
        return document.save('contacts', contact).then(() => {
          return contact.stripeCustomerId;
        });
      });
    });
  });
};
