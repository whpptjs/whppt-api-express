import { EventSessionFactory } from './events/Session';
import { Gallery } from './gallery';
import { MongoService } from './mongo';

export type ContextType = {
  $id: any;
  $logger?: any;
  $image?: any;
  $file?: any;
  $security?: any;
  $mongo: MongoService;
  $modules?: any;
  $pageTypes?: any;
  $fullUrl?: any;
  $sitemap?: any;
  $roles: { validate: (user: any, roles: any[]) => Promise<void> };
  $env?: any;
  $publishing?: any;
  $email?: any;
  $gallery?: Gallery;
  EventSession: EventSessionFactory;
  [key: string]: any;
};

export type Service<T> = (context: ContextType) => T;

export type PageType = {
  key?: string;
  name: string;
  label: string;
  collection?: { name: string };
};

export type ContextArgs = {
  modules?: any;
  services?: any;
  pageTypes?: PageType[];
  disablePublishing: boolean;
  onPublish?: (page: any) => void;
  onUnPublish?: (page: any) => void;
  collections?: string[];
};
