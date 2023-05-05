import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import { Secure } from '../staff/Secure';
import { Order } from './Models/Order';
import { sub } from 'date-fns';

const listReadyToDispatch: HttpModule<
  { currentPage: string; size: string },
  { orders: Order[]; total: number }
> = {
  exec({ $database }, { currentPage = '1', size = '10' }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      const forteenDaysAgo = sub(new Date(), {
        days: 14,
      });

      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>(
            [
              {
                $match: {
                  checkoutStatus: 'paid',
                  'payment.status': 'paid',
                  'shipping.pickup': { $ne: true },
                  legacyOrder: { $exists: false },
                },
              },
              {
                $match: {
                  $or: [
                    {
                      'payment.date': { $gte: forteenDaysAgo },
                      dispatchedStatus: { $ne: 'dispatched' },
                    },
                  ],
                },
              },
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.date' } },
                  orders: {
                    $push: {
                      _id: '$_id',
                      date: '$payment.date',
                      checkoutStatus: '$checkoutStatus',
                      dispatchedStatus: '$dispatchedStatus',
                      shipmentId: '$shipping.ausPost.shipmentId',
                      payment: {
                        amount: '$payment.amount',
                      },
                    },
                  },
                },
              },
              {
                $sort: {
                  _id: -1,
                },
              },
              {
                $skip: parseInt(size) * parseInt(currentPage),
              },
              {
                $limit: parseInt(size),
              },
            ],
            { allowDiskUse: true }
          )
          .toArray(),
        db
          .collection('orders')
          .aggregate<Order>(
            [
              {
                $match: {
                  checkoutStatus: 'paid',
                  'payment.status': 'paid',
                  'shipping.pickup': { $ne: true },
                  legacyOrder: { $exists: false },
                },
              },
              {
                $match: {
                  $or: [
                    {
                      'payment.date': { $gte: forteenDaysAgo },
                      dispatchedStatus: { $ne: 'dispatched' },
                    },
                  ],
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$payment.date',
                    },
                  },
                },
              },
            ],
            { allowDiskUse: true }
          )
          .toArray(),
      ]).then(([orders, total]) => {
        return { orders, total: total.length };
      });
    });
  },
};

export default Secure(listReadyToDispatch);
