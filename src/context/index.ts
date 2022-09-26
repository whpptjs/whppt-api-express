import { compact, forEach, map } from 'lodash';
import { ContextArgs, ContextType } from './Context';
import { EventSession, CreateEvent } from './events';
import {
  FileService,
  GalleryService,
  IdService,
  ImageService,
  LoggerService,
  MongoService,
  SecurityService,
} from '../Services';
import { PageType } from 'src/Services/Config';

const Email = require('./email');
const loadModules = require('./modules/loadModules');
const { ValidateRoles, saveRole, isGuest } = require('./roles');
const sitemapQuery = require('./sitemap');

const $env = process.env;

const voidCallback = () => {};

const genericPageType = {
  name: 'page',
  label: 'Generic',
  collection: { name: 'pages' },
} as PageType;

const Context = (
  $id: IdService,
  $logger: LoggerService,
  $security: SecurityService,
  mongoPromise: Promise<MongoService>,
  $gallery: GalleryService,
  $image: ImageService,
  $file: FileService,
  options: ContextArgs = {
    disablePublishing: false,
  }
) => {
  return Promise.resolve().then(() => {
    options.modules = options.modules || {};
    options.services = options.services || {};
    options.collections = options.collections || [];
    options.disablePublishing = options.disablePublishing || false;

    const $pageTypes =
      options.pageTypes && options.pageTypes.length
        ? options.pageTypes
        : [genericPageType];
    const pageTypeCollections = compact(
      map(
        $pageTypes,
        pageType => (pageType.collection && pageType.collection.name) || pageType.key
      )
    );
    const pageTypeHistoryCollections = map(
      pageTypeCollections,
      pageTypeName => pageTypeName + 'History'
    );

    const collections = [
      'dependencies',
      'gallery',
      'users',
      ...options.collections,
      ...pageTypeCollections,
      ...pageTypeHistoryCollections,
    ];

    return mongoPromise.then($mongo => {
      return $mongo.ensureCollections(collections).then(() => {
        const $fullUrl = (slug: string) => `${$env.BASE_URL}/${slug}`;

        const $modules = loadModules().then((modules: any) => ({
          ...modules,
          ...options.modules,
        }));

        const _context = {
          $id,
          $logger,
          $image,
          $file,
          $security,
          $mongo,
          $modules,
          $pageTypes,
          $fullUrl,
          $sitemap: {
            filter: sitemapQuery({ $mongo, $pageTypes, $fullUrl }),
          },
          $roles: {
            validate: ValidateRoles({ $mongo, $env }),
            save: saveRole({ $id, $mongo }),
            isGuest: isGuest({ $mongo }),
          },
          $env,
          $publishing: {
            onPublish: options.onPublish || voidCallback,
            onUnPublish: options.onUnPublish || voidCallback,
          },
          EventSession: EventSession({} as ContextType),
        } as ContextType;

        _context.$email = Email(_context);
        _context.$gallery = $gallery;
        _context.CreateEvent = CreateEvent;

        forEach(options.services, (serviceValue, serviceName) => {
          _context[`$${serviceName}`] = serviceValue(_context);
        });
        return _context;
      });
    });
  });
};

export default Context;
export { Context };
