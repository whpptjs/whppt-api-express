import { HttpModule } from '../HttpModule';
import { MembershipOptions, MembershipTier } from './Models/MembershipTier';
import assert from 'assert';

const getEntryLevelTier: HttpModule<{ domainId: string }, MembershipTier> = {
  exec({ $database }, { domainId }) {
    return $database.then(({ document }) => {
      return document
        .query<MembershipOptions>('site', {
          filter: { _id: `membershipOptions_${domainId}` },
        })
        .then(membershipOptions => {
          assert(membershipOptions, 'No tiers set up for this domain');
          const entryTier = membershipOptions?.membershipTiers.find(t => t.level === 1);
          assert(entryTier, 'No Entry tiers set up for this domain');
          return entryTier;
        });
    });
  },
};

export default getEntryLevelTier;
