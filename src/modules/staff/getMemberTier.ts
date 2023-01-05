import { HttpModule } from '../HttpModule';
import { queryMemberTier } from '../order/Queries/queryMemberTier';
import { Secure } from './Secure';

const getMemberTier: HttpModule<{ memberId: string; domainId: string }, any> = {
  exec(context, args) {
    return queryMemberTier(context, args);
  },
};

export default Secure(getMemberTier);
