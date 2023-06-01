import { HttpModule } from '../HttpModule';
import { Secure } from './Secure';

const getXeroTrackingLists: HttpModule<{ memberId: string; domainId: string }, any> = {
  authorise({ $roles }, { user }) {
    console.log('🚀 ~ file: getXeroTrackingLists.ts:8 ~ authorise ~ user:', user);
    return $roles.validate(user, []);
  },
  exec(context, __) {
    return context.$xero();
  },
};

export default Secure(getXeroTrackingLists);
