import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { GalleryItem } from './GalleryItem';

const save: HttpModule<{ item?: GalleryItem }> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $save } }, { item }) {
    assert(item, 'Gallery item is required');
    assert(item.domainId, 'Gallery item requires a domain id');

    return $save('gallery', item).then(savedItem => ({
      item: savedItem,
    }));
  },
};

export default save;
