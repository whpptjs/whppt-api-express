import { HttpModule } from '../HttpModule';
import { queryMemberLifetimeSpend } from '../order/Queries/queryMemberLifetimeSpend';
import { queryMemberTier } from '../order/Queries/queryMemberTier';
import { Secure } from './Secure';

const getMemberTier: HttpModule<{ memberId: string; domainId: string }, any> = {
  exec(context, args) {
    return queryMemberTier(context, args).then(tier => {
      return queryMemberLifetimeSpend(context, args).then(lifetimeSpend => {
        return {
          ...tier,
          lifetimeSpend,
        };
      });
    });
  },
};

export default Secure(getMemberTier);
