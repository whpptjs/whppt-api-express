import assert from 'assert';
import { HttpModule } from '../HttpModule';

type Dependency = {
  _id: string;
  parentId: string;
  slug: string;
  type: string;
  galleryItemId: string;
};

const load: HttpModule<{ itemId: string; parentId: string }, Dependency | undefined> = {
  authorise({ $roles }, { user }) {
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $db } }, { itemId, parentId }) {
    assert(itemId, 'itemId is required');
    assert(parentId, 'parentId ID is required');

    return $db
      .collection('dependencies')
      .findOne<Dependency>({ _id: `${itemId}_${parentId}` })
      .then(item => item || undefined);
  },
};

export default load;
