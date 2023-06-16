import { HttpModule } from '../HttpModule';

const getUnleashedTrackingDetails: HttpModule<
  { memberId: string; domainId: string },
  any
> = {
  authorise({ $roles }, { user }) {
    return Promise.resolve(!$roles.isGuest(user));
  },
  exec(context, __) {
    return context.$unleashed().$getTrackingDetails();
  },
};

export default getUnleashedTrackingDetails;
