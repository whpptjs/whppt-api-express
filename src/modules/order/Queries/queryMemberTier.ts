import assert from 'assert';
import { ContextType } from 'src/context/Context';
import {
  MembershipOptions,
  MembershipTier,
} from 'src/modules/membershipTier/Models/MembershipTier';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import orderBy from 'lodash/orderBy';
import { queryMemberAmountSpentForYear } from './queryMemberAmountSpentForYear';

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
      assert(member, 'Member not found');
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
        ({ discountAppliedForYear, amountSpentForYear }) => {
          const sortedTiers = orderBy(
            membershipOptions.membershipTiers,
            ['level'],
            ['desc']
          ) as MembershipTier[];

          const currentTier = sortedTiers.find(
            t => t.entryLevelSpend <= amountSpentForYear
          );
          const nextTierLevel = (currentTier?.level || 0) + 1;
          const nextTier = sortedTiers.find(t => t.level === nextTierLevel);

          return {
            ...currentTier,
            discountAppliedForYear,
            amountSpentForYear,
            amountToSpendToNextTier: nextTier
              ? nextTier.entryLevelSpend - (amountSpentForYear - discountAppliedForYear)
              : 0,
            nextTiers: calculateNextTiers(membershipOptions.membershipTiers),
          } as MembershipTier;

          function calculateNextTiers(tiers: MembershipTier[]) {
            const nextTiers: MembershipTier[] = currentTier
              ? tiers.filter(t => t.level > currentTier.level)
              : tiers;

            return nextTiers.map((t, i) => ({
              ...t,
              amountToSpendToNextTier:
                i === 0
                  ? t.entryLevelSpend - (amountSpentForYear - discountAppliedForYear)
                  : calculatePreviousTiers(i) - amountSpentForYear,
            }));

            function calculatePreviousTiers(currentTierIndex: number) {
              const totalToSpendInThisAndPrevTiers =
                tiers.reduce((acc, t, i) => {
                  if (currentTierIndex < i) {
                    return acc + t.entryLevelSpend;
                  }

                  return acc;
                }, 0) || 0;

              return totalToSpendInThisAndPrevTiers;
            }
          }
        }
      );
    });
  });
};
