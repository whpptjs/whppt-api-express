import { ContextType } from 'src/context/Context';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { Order } from '../Models/Order';

export type QueryMemberAmountSpentForYear = (
  context: ContextType,
  args: { memberId?: string }
) => Promise<{ discountAppliedForYear: number; amountSpentForYear: number }>;

export const queryMemberAmountSpentForYear: QueryMemberAmountSpentForYear = (
  { $database },
  { memberId }
) => {
  if (!memberId) return Promise.resolve(0);

  const year = new Date().getFullYear();
  const startYear = new Date(`1/1/${year - 1} 10:30`);
  const endYear = new Date(`1/1/${year + 1} 10:30`);

  return $database.then(database => {
    const { db } = database as WhpptMongoDatabase;
    return db
      .collection('orders')
      .aggregate<Order>([
        {
          $match: {
            memberId: memberId,
            'payment.status': 'paid',

            $and: [
              {
                updatedAt: {
                  $gte: startYear,
                },
              },
              {
                updatedAt: { $lt: endYear },
              },
            ],
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
        const amountSpentForYear = orders.reduce(
          (partialSum, a) =>
            partialSum + (a?.payment?.subTotal ? a?.payment?.subTotal : 0),
          0
        );

        const discountAppliedForYear = orders.reduce(
          (partialSum, a) =>
            partialSum +
            (a?.payment?.memberShippingDiscount ? a?.payment?.memberShippingDiscount : 0),
          0
        );

        return {
          discountAppliedForYear,
          amountSpentForYear,
        };
      });
  });
};
