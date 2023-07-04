import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Order } from '../order/Models/Order';
import { Secure } from './Secure';

export type ListOrdersRetured = {
  orders: any[];
  total: number;
};

const listSales: HttpModule<
  {
    limit: string;
    dateFromYear?: number;
    dateFromMonth?: number;
    dateFromDay?: number;
    dateToYear?: number;
    dateToMonth?: number;
    dateToDay?: number;
    currentPage: string;
    origin?: string;
    staffId?: string;
    paymentType?: string;
    status: 'paid';
  },
  ListOrdersRetured
> = {
  exec(
    { $database },
    {
      dateFromYear,
      dateFromMonth,
      dateFromDay,
      dateToYear,
      dateToMonth,
      dateToDay,
      limit = '10',
      currentPage = '0',
      origin,
      staffId,
      paymentType,
      status = 'paid',
    }
  ) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {
        $and: [
          { _id: { $exists: true } },
          { checkoutStatus: status ? status : { $exists: true } },
        ],
      } as any;

      if (staffId) {
        query.$and.push({
          'staff._id': staffId,
        });
      }

      if (dateFromYear && dateFromMonth && dateFromDay) {
        query.$and.push({
          'payment.date': {
            $gte: new Date(dateFromYear, dateFromMonth, dateFromDay, 0, 0, 0, 0),
          },
        });
      }
      if (dateToYear && dateToMonth && dateToDay) {
        query.$and.push({
          'payment.date': {
            $lt: new Date(dateToYear, dateToMonth, dateToDay, 0, 0, 0, 0),
          },
        });
      }

      if (origin) {
        query.$and.push({
          fromPos: { $exists: origin === 'pos' },
        });
      }
      if (paymentType) {
        query.$and.push({
          'payment.type': paymentType,
        });
      }

      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: query,
            },
            {
              $sort: {
                updatedAt: -1,
              },
            },
            {
              $project: {
                member: 0,
                stripe: 0,
              },
            },
            {
              $skip: parseInt(limit) * parseInt(currentPage),
            },
            {
              $limit: parseInt(limit),
            },
          ])
          .toArray(),
        db.collection('orders').countDocuments(query),
        db
          .collection('orders')
          .aggregate<any>([
            {
              $match: query,
            },
            {
              $project: {
                quantities: { $sum: '$items.quantity' },
                payment: 1,
              },
            },
          ])
          .toArray(),
      ]).then(([orders, total = 0, orderAmounts]) => {
        const { salesTotal = 0, itemsTotal = 0 } = calulateAmounts(orderAmounts || []);
        return {
          orders: removeShippingFromOrders(orders),
          total,
          salesTotal,
          itemsTotal,
        };
      });
    });
  },
};

const removeShippingFromOrders = (orders: any) => {
  return orders.map((o: any) => ({
    ...o,
    payment: { ...o.payment, amount: o.payment.amount - calcShippingCost(o.payment) },
  }));
};
const calulateAmounts = (orders: any) => {
  let salesTotal = 0;
  let itemsTotal = 0;

  orders.forEach((order: any) => {
    itemsTotal = order.quantities + itemsTotal;
    const shipping = calcShippingCost(order.payment);
    salesTotal = order.payment.amount - shipping + salesTotal;
  });

  return { salesTotal, itemsTotal };
};

const calcShippingCost = (payment: any) => {
  return payment?.shippingCost?.type === 'pickup'
    ? 0
    : (payment?.shippingCost?.price || 0) - (payment?.memberShippingDiscount || 0) || 0;
};

export default Secure(listSales);
