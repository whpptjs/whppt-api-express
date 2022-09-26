import { forEach } from 'lodash';
import { ContextOptions, ContextType, UseService } from './Context';
import { EventSession, CreateEvent } from './events';
import {
  FileService,
  GalleryService,
  IdService,
  ImageService,
  LoggerService,
  ConfigService,
  SecurityService,
  DatabaseConnection,
} from '../Services';
import { MongoDatabaseConnection } from '../Services/Database/Mongo/Connection';

const Email = require('./email');
const { ValidateRoles, saveRole, isGuest } = require('./roles');
const sitemapQuery = require('./sitemap');

const $env = process.env;

const voidCallback = () => {};

const Context = (
  $id: IdService,
  $logger: LoggerService,
  $security: SecurityService,
  databasePromise: Promise<DatabaseConnection>,
  config: ConfigService,
  $gallery: GalleryService,
  $image: ImageService,
  $file: FileService,
  options: ContextOptions = {
    disablePublishing: false,
  }
) => {
  return Promise.resolve().then(() => {
    return databasePromise.then(dbConnection => {
      // TODO: Support other databases. Currently only Mongo is supported and we use it directly here.
      const database = (dbConnection as MongoDatabaseConnection).getMongoDatabase();
      const $fullUrl = (slug: string) => `${$env.BASE_URL}/${slug}`;

      const _context = {
        $id,
        $logger,
        $image,
        $file,
        $security,
        $mongo: database,
        $modules: config.runtime.modules,
        $pageTypes: config.runtime.pageTypes,
        $fullUrl,
        $sitemap: {
          filter: sitemapQuery({
            $mongo: database,
            $pageTypes: config.runtime.pageTypes,
            $fullUrl,
          }),
        },
        $roles: {
          validate: ValidateRoles({ $mongo: database, $env }),
          save: saveRole({ $id, $mongo: database }),
          isGuest: isGuest({ $mongo: database }),
        },
        $env,
        $publishing: {
          onPublish: options.onPublish || voidCallback,
          onUnPublish: options.onUnPublish || voidCallback,
        },
        EventSession: EventSession({} as ContextType),
        useService: <T>(name: string) =>
          _context[name] ? (_context[name] as T) : undefined,
      } as ContextType;

      _context.$email = Email(_context);
      _context.$gallery = $gallery;
      _context.CreateEvent = CreateEvent;

      forEach(config.runtime.services, (serviceConstructor, serviceName) => {
        _context[`$${serviceName}`] = serviceConstructor(_context);
      });
      return _context;
    });
  });
};

export default Context;
export { Context };
