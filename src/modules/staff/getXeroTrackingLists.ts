import { HttpModule } from '../HttpModule';

const getXeroTrackingLists: HttpModule<{ memberId: string; domainId: string }, any> = {
  authorise({ $roles }, { user }) {
    return Promise.resolve(!$roles.isGuest(user));
  },
  exec(context, __) {
    return context.$xero().getXeroTrackingDetails();
  },
};

export default getXeroTrackingLists;
