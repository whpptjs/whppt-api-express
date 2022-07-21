import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { GalleryItem } from './GalleryItem';

const load: HttpModule<{ itemId?: string }, { item?: GalleryItem | null }> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $db } }, { itemId }) {
    assert(itemId, 'itemId is required');

    return $db
      .collection('gallery')
      .findOne<GalleryItem>({ _id: itemId })
      .then(item => ({ item }));
  },
};

export default load;
