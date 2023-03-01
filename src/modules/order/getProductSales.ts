import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

import { Order } from './Models/Order';
import { loadOrderWithProducts } from './Queries/loadOrderWithProducts';

const getProductSales: HttpModule<
  {
    dateFrom?: string;
    dateTo?: string;
    limit: string;
    currentPage: string;
    origin: string;
    marketArea: string;
    customerId: string;
  },
  any
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec(
    context,
    { dateFrom, dateTo, limit = '10', currentPage = '0', origin, marketArea, customerId }
  ) {
    return context.$database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {
        $and: [{ _id: { $exists: true }, checkoutStatus: 'paid' }],
      } as any;

      if (dateFrom) {
        query.$and.push({
          createdAt: { $gte: new Date(dateFrom) },
        });
      }

      if (dateTo) {
        query.$and.push({
          createdAt: { $lt: dateTo ? new Date(dateTo) : new Date() },
        });
      }

      if (origin) {
        query.$and.push({
          fromPos: { $exists: origin === 'pos' },
        });
      }

      if (customerId) {
        query.$and.push({
          'contact._id': customerId,
        });
      }
      if (marketArea) {
        query.$and.push({
          'staff.marketArea': marketArea,
        });
      }

      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            { $project: { _id: 1 } },
            {
              $sort: {
                updatedAt: -1,
              },
            },
            {
              $skip: parseInt(limit) * parseInt(currentPage),
            },
            {
              $limit: parseInt(limit),
            },
          ])
          .toArray()
          .then(orders => {
            const ordersWithProductsPromises: any = [];

            orders.forEach(order => {
              ordersWithProductsPromises.push(
                loadOrderWithProducts(context, { _id: order._id }).then(_order => {
                  const memberDiscount = _order?.payment?.memberTotalDiscount
                    ? Number(_order?.payment?.memberTotalDiscount)
                    : undefined;

                  const totalPrice = Number(_order?.payment?.subTotal);

                  return {
                    ..._order,
                    items: _order.items.map(item => {
                      const purchasedPrice = Number(item.purchasedPrice);
                      const ratio = totalPrice
                        ? purchasedPrice / totalPrice
                        : purchasedPrice;

                      const multiplyRatio =
                        memberDiscount && ratio ? memberDiscount * ratio : false;

                      const unitPriceWithDiscount = multiplyRatio
                        ? purchasedPrice - multiplyRatio
                        : purchasedPrice;

                      return {
                        ...item,
                        unitPriceWithDiscount,
                        discountApplied: unitPriceWithDiscount
                          ? ((purchasedPrice - unitPriceWithDiscount) / purchasedPrice) *
                            100
                          : 0,
                      };
                    }),
                  };
                })
              );
            });

            return Promise.all(ordersWithProductsPromises).then(orders => orders);
          }),
        db.collection('orders').countDocuments(query),
      ]).then(([orders, total]) => {
        return { orders, total };
      });
    });
  },
};

export default getProductSales;
