import { IdService, LoggerService, SecurityService } from '../Services';
import { EventSessionFactory } from './events/Session';
import { GalleryService, MongoService, ImageService, FileService } from '../Services';
import { PageType } from '../Services/Config';

export type ContextType = {
  $id: IdService;
  $logger: LoggerService;
  $security: SecurityService;
  $mongo: MongoService;
  $image?: ImageService;
  $file?: FileService;
  $modules?: any;
  $pageTypes?: any;
  $fullUrl?: any;
  $sitemap?: any;
  $roles: { validate: (user: any, roles: any[]) => Promise<void> };
  $env?: any;
  $publishing?: any;
  $email?: any;
  $gallery?: GalleryService;
  EventSession: EventSessionFactory;
  useService: UseService;
  [key: string]: any;
};

export type ContextService<T> = (context: ContextType) => T;
export type UseService = <T>(serviceName: string) => T | undefined;

export type ContextOptions = {
  disablePublishing?: boolean;
  onPublish?: (page: any) => void;
  onUnPublish?: (page: any) => void;
};
