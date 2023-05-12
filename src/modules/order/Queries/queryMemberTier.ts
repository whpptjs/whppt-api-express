import assert from 'assert';
import { ContextType } from 'src/context/Context';
import {
  MembershipOptions,
  MembershipTier,
} from 'src/modules/membershipTier/Models/MembershipTier';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { queryMemberAmountSpentForYear } from './queryMemberAmountSpentForYear';
import { calculateMembershipTier } from './helpers/calculateMembershipTier';
import { queryMemberLifetimeSpend } from './queryMemberLifetimeSpend';

export type QueryMemberTier = (
  context: ContextType,
  args: { memberId?: string; domainId: string; orderId?: string }
) => Promise<MembershipTier>;

export const queryMemberTier: QueryMemberTier = (context, { memberId, domainId }) => {
  if (!memberId) return Promise.resolve({} as MembershipTier);

  return context.$database.then(database => {
    assert(domainId, 'Domain Id required');

    const { db, document } = database as WhpptMongoDatabase;

    return Promise.all([
      db.collection('members').findOne({ _id: memberId }),
      document.query<MembershipOptions>('site', {
        filter: { _id: `membershipOptions_${domainId}` },
      }),
    ]).then(([member, membershipOptions]) => {
      assert(member, `Member not found for ID:${memberId}`);
      assert(membershipOptions, 'Member Tiers not found');

      const lockedTier = member?.lockToTier
        ? membershipOptions?.membershipTiers?.find(tier => tier._id === member.lockToTier)
        : undefined;

      if (lockedTier)
        return {
          ...lockedTier,
          lockToTier: member.lockToTier,
          amountToSpendToNextTier: 0,
        } as MembershipTier;

      return queryMemberAmountSpentForYear(context, { memberId }).then(
        ({ currentYear, previousYear }) => {
          const tier = calculateMembershipTier(
            membershipOptions,
            currentYear,
            previousYear
          );
          return queryMemberLifetimeSpend(context, { memberId }).then(lifetimeSpend => {
            return {
              ...tier,
              lifetimeSpend,
            };
          });
        }
      );
    });
  });
};
