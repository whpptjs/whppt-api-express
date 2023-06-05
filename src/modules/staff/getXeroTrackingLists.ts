import { HttpModule } from '../HttpModule';
import { Secure } from './Secure';

const getXeroTrackingLists: HttpModule<{ memberId: string; domainId: string }, any> = {
  authorise({ $roles }, { user }) {
    return Promise.resolve(!$roles.isGuest(user));
  },
  exec(context, __) {
    return context.$xero().getXeroTrackingDetails();
  },
};

export default Secure(getXeroTrackingLists);
