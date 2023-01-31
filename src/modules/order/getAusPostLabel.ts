import { HttpModule } from '../HttpModule';

const getAusPostLabel: HttpModule<
  { labelRequestId: string },
  { url: string; labelStatus: string }
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $auspost }, { labelRequestId }) {
    const { getLabel } = $auspost;

    return getLabel(labelRequestId);
  },
};

export default getAusPostLabel;
