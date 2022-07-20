import assert from 'assert';
import { Db } from 'mongodb';

export type Context = {
  $roles: { validate: (user: any, roles: any[]) => Promise<void> };
  $mongo: { $db: Db };
};
export type Authorise = (context: Context, args: any) => Promise<any>;
export type Exec<T> = (context: Context, args: any) => Promise<T>;

export type HttpModule<T> = {
  authorise: Authorise;
  exec: Exec<T>;
};

export type GalleryItem = { _id: string };

module.exports = {
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
      .toArray();
  },
} as HttpModule<GalleryItem[]>;
