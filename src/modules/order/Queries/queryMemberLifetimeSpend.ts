import { ContextType } from 'src/context/Context';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { Order } from '../Models/Order';

export type QueryMemberLifetimeSpend = (
  context: ContextType,
  args: { memberId?: string }
) => Promise<number>;

export const queryMemberLifetimeSpend: QueryMemberLifetimeSpend = (
  { $database },
  { memberId }
) => {
  if (!memberId) return Promise.resolve(0);
  return $database.then(database => {
    const { db } = database as WhpptMongoDatabase;
    return db
      .collection('orders')
      .aggregate<Order>([
        {
          $match: {
            memberId: memberId,
            'payment.status': 'paid',
          },
        },
        {
          $project: {
            payment: 1,
          },
        },
      ])
      .toArray()
      .then(orders => {
        if (!orders || !orders.length) return 0;

        return orders.reduce(
          (partialSum, a) =>
            partialSum +
            (a?.payment?.subTotal
              ? a?.payment?.subTotal - (a?.payment?.discountApplied || 0)
              : 0),
          0
        );
      });
  });
};
