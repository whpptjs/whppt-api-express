import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { Order } from './Models/Order';

const loadCart: HttpModule<{ orderId: string }, Order | {}> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $database }, { orderId }) {
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
                    images: '$items.product.images',
                    featureImageId: '$items.product.featureImageId',
                    customFields: '$items.product.customFields',
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
        .then(orders => orders[0] || []);
    });
  },
};

export default loadCart;
