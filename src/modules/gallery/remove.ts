import assert from 'assert';
import { HttpModule } from '../HttpModule';

const load: HttpModule<{ itemId?: string }, void> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $db } }, { itemId }) {
    assert(itemId, 'itemId is required');

    return $db
      .collection('gallery')
      .deleteOne({ _id: itemId })
      .then(() => {});
  },
};

export default load;
