import { ContextType } from 'src/context/Context';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { Order } from '../Models/Order';

type MembershipYearlyCalc = {
  amount: number;
  discountApplied: number;
};

export type QueryMemberAmountSpentForYear = (
  context: ContextType,
  args: { memberId?: string }
) => Promise<{
  currentYear: MembershipYearlyCalc;
  previousYear: MembershipYearlyCalc;
}>;

export const queryMemberAmountSpentForYear: QueryMemberAmountSpentForYear = (
  { $database },
  { memberId }
) => {
  if (!memberId)
    return Promise.resolve({
      currentYear: {
        amount: 0,
        discountApplied: 0,
      },
      previousYear: {
        amount: 0,
        discountApplied: 0,
      },
    });

  const year = new Date().getFullYear();
  const startOfLastYear = new Date(`1/1/${year - 1} 10:30`);
  const startOfThisYear = new Date(`1/1/${year} 10:30`);
  const endOfThisYear = new Date(`1/1/${year + 1} 10:30`);

  return $database.then(database => {
    const { db } = database as WhpptMongoDatabase;
    return Promise.all([
      db
        .collection('orders')
        .aggregate<Order>(buildQuery(memberId, startOfThisYear, endOfThisYear))
        .toArray(),
      db
        .collection('orders')
        .aggregate<Order>(buildQuery(memberId, startOfLastYear, startOfThisYear))
        .toArray(),
    ]).then(([thisYearsOrders, lastYearsOrders]) => {
      const amountSpentForYear = calcAmountSpentTowardsMembership(thisYearsOrders);
      const discountAppliedForYear = calcDiscount(thisYearsOrders);
      const amountSpentForLastYear = calcAmountSpentTowardsMembership(lastYearsOrders);
      const discountAppliedForLastYear = calcDiscount(lastYearsOrders);

      return {
        currentYear: {
          amount: amountSpentForYear,
          discountApplied: discountAppliedForYear,
        },
        previousYear: {
          amount: amountSpentForLastYear,
          discountApplied: discountAppliedForLastYear,
        },
      };
    });
  });
};

const calcAmountSpentTowardsMembership = (orders: Order[]) => {
  return orders.reduce((partialSum: number, _order) => {
    const amount = _order?.payment?.amount || 0;
    const shippingCostPreDiscount = Number(
      _order?.payment?.shippingCost?.price || _order?.shipping?.shippingCost?.price || 0
    );
    const memberShippingDiscount = Number(_order?.payment?.memberShippingDiscount || 0);
    const shippingCost =
      shippingCostPreDiscount - memberShippingDiscount > 0
        ? shippingCostPreDiscount - memberShippingDiscount
        : 0;
    return partialSum + (amount - shippingCost);
  }, 0);
};
const calcDiscount = (orders: Order[]) => {
  return orders.reduce(
    (partialSum, a) =>
      partialSum +
      (a?.payment?.memberTotalDiscount ? a?.payment?.memberTotalDiscount : 0),
    0
  );
};

const buildQuery = (memberId: string, start: Date, end: Date) => [
  {
    $match: {
      memberId: memberId,
      'payment.status': 'paid',

      $and: [
        {
          updatedAt: {
            $gte: start,
          },
        },
        {
          updatedAt: { $lt: end },
        },
      ],
    },
  },
  {
    $project: {
      payment: 1,
    },
  },
];
