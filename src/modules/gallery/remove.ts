import assert from 'assert';
import { HttpModule } from '../HttpModule';

const load: HttpModule<{ itemId?: string; type: string }, void> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $delete, $startTransaction }, $storage }, { itemId, type }) {
    assert(itemId, 'itemId is required');
    assert(type, 'Item type is reqiured.');
    return $startTransaction(async session => {
      return $delete('gallery', itemId, { session })
        .then(() => $storage.remove(itemId, type))
        .then(() => {});
    });
  },
};

export default load;
