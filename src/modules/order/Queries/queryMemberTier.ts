import assert from 'assert';
import { ContextType } from 'src/context/Context';
import {
  MembershipOptions,
  MembershipTier,
} from 'src/modules/membershipTier/Models/MembershipTier';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { Order } from '../Models/Order';

export type QueryMemberTier = (
  context: ContextType,
  args: { memberId?: string; domainId: string }
) => Promise<MembershipTier>;

export const queryMemberTier: QueryMemberTier = (
  { $database },
  { memberId, domainId }
) => {
  if (!memberId) return Promise.resolve({} as MembershipTier);
  return $database.then(database => {
    assert(domainId, 'Domain Id required');

    // const year = new Date().getFullYear();
    // const startYear = new Date(`1/1/${year} 10:30`);
    // const endYear = new Date(`1/1/${year + 1} 10:30`);

    const { db, document } = database as WhpptMongoDatabase;
    return Promise.all([
      document.query<MembershipOptions>('site', {
        filter: { _id: `membershipOptions_${domainId}` },
      }),
      db
        .collection('orders')
        .aggregate<Order>([
          {
            $match: {
              memberId: memberId,
              'payment.status': 'paid',

              // $and: [
              //   {
              //     updatedAt: {
              //       $gte: startYear,
              //     },
              //   },
              //   {
              //     updatedAt: { $lt: endYear },
              //   },
              // ],
            },
          },
          {
            $project: {
              stripe: 1,
            },
          },
        ])
        .toArray(),
    ]).then(([tiers, orders]) => {
      assert(tiers, 'MembershipTiers not found.');

      const sortedTiers = tiers.membershipTiers.sort(a => a.level);

      const amountSpentForYear = orders.reduce(
        (partialSum, a) => partialSum + (a?.payment?.amount ? a?.payment?.amount : 0),
        0
      );

      const currentTier = sortedTiers.find(t => t.entryLevelSpend <= amountSpentForYear);
      const nextTierLevel = (currentTier?.level || 0) + 1;
      const nextTier = sortedTiers.find(t => t.level === nextTierLevel);

      return {
        ...currentTier,
        amountToSpendToNextTier: nextTier
          ? nextTier.entryLevelSpend - amountSpentForYear
          : 0,
      } as MembershipTier;
    });
  });
};
