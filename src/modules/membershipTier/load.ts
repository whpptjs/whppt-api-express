import { HttpModule } from '../HttpModule';
import { MembershipOptions } from './Models/MembershipTier';

const load: HttpModule<{ domainId: string }, MembershipOptions> = {
  exec({ $database }, { domainId }) {
    return $database.then(({ document }) => {
      return document
        .fetch<MembershipOptions>('site', `membershipOptions_${domainId}`)
        .then(membershipOptions => {
          return membershipOptions || {};
        });
    });
  },
};

export default load;
