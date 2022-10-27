import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

import { Order } from './Models/Order';

const findOrderForSession: HttpModule<{ orderId?: string }, Order | {}> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $database }, { orderId }) {
    const query = orderId ? { _id: orderId } : { orderStatus: { $ne: 'completed' } };
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection<Order>('orders')
        .aggregate([
          {
            $match: query,
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
                    quantityAvailable: '$items.product.quantityAvailable',
                    price: '$items.product.price',
                  },
                },
              },
            },
          },
        ])
        .toArray()
        .then(orders => {
          return orders[0] || {};
        });
    });
  },
};

export default findOrderForSession;
