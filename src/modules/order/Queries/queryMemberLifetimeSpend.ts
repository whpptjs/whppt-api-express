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
            checkoutStatus: 'paid',
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

        // const totalAmount = orders.reduce((partialSum, a) => {
        //   const _subtotal = a?.payment?.amount
        //     ? a?.payment?.amount - Number(a?.payment?.shippingCost?.price || 0)
        //     : 0;
        //   const subtotal = _subtotal >= 0 ? _subtotal : 0;
        //   return partialSum + subtotal;
        // }, 0);

        const totalAmount = orders.reduce((partialSum: number, _order) => {
          const amount = _order?.payment?.amount || 0;
          const shippingCostPreDiscount = Number(
            _order?.payment?.shippingCost?.price ||
              _order?.shipping?.shippingCost?.price ||
              0
          );
          const memberShippingDiscount = Number(
            _order?.payment?.memberShippingDiscount || 0
          );
          const shippingCost =
            shippingCostPreDiscount - memberShippingDiscount > 0
              ? shippingCostPreDiscount - memberShippingDiscount
              : 0;
          return partialSum + (amount - shippingCost);
        }, 0);

        return totalAmount;
      });
  });
};
