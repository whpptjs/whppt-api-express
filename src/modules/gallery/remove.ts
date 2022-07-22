import assert from 'assert';
import { HttpModule } from '../HttpModule';

const load: HttpModule<{ itemId?: string }, void> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $delete, $startTransaction }, $aws }, { itemId }) {
    assert(itemId, 'itemId is required');
    return $startTransaction(async session => {
      return $delete('gallery', itemId, { session })
        .then(() => $aws.removeDocFromS3(itemId))
        .then(() => {});
    });
  },
};

export default load;
