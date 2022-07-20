import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { GalleryItem } from './GalleryItem';

const search: HttpModule<{ domainId: string }, { items: GalleryItem[] }> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $db } }, { domainId }) {
    assert(domainId, 'Please provide a domainId');

    return $db
      .collection('gallery')
      .find<GalleryItem>({ domainId })
      .toArray()
      .then(items => ({ items }));
  },
};

export default search;
