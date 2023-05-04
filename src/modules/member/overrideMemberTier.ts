import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { MembershipOptions } from '../membershipTier/Models/MembershipTier';
import { Secure } from '../staff/Secure';
import { Member } from './Model';

const overrideMemberTier: HttpModule<
  { domainId: string; membershipTierId: string; memberId: string },
  any
> = {
  exec({ $database, createEvent }, { domainId, membershipTierId, memberId }) {
    return $database.then(({ document, startTransaction }) => {
      return Promise.all([
        document.fetch<MembershipOptions>('site', `membershipOptions_${domainId}`),
        document.fetch<Member>('members', memberId),
      ]).then(([membershipOptions, member]) => {
        assert(membershipOptions, 'Membership Tiers not set up');
        const foundTier = membershipOptions.membershipTiers.find(
          i => i._id === membershipTierId
        );

        member.lockToTier = foundTier ? membershipTierId : undefined;

        const memberEvents = [
          foundTier
            ? createEvent('MembersTierLocked', { _id: member._id, membershipTierId })
            : createEvent('MembersTierUnlocked', { _id: member._id }),
        ];

        return startTransaction(session => {
          return document.saveWithEvents('members', member, memberEvents, {
            session,
          });
        });
      });
    });
  },
};

export default Secure(overrideMemberTier);
