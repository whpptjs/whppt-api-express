import { forEach } from 'lodash';
import { ContextType } from './Context';
import { EventSession, CreateEvent } from './events';
import { Identity } from './identity';
import SalesForce from './SalesForce';
import Unleashed from './Unleashed';

import {
  FileService,
  GalleryService,
  IdService,
  ImageService,
  LoggerService,
  ConfigService,
  SecurityService,
  WhpptDatabase,
  HostingConfig,
  StorageService,
  EmailServiceConstructor,
  AusPostService,
  XeroService,
} from '../Services';
import { WhpptMongoDatabase } from '../Services/Database/Mongo/Database';

const { ValidateRoles, saveRole, isGuest } = require('./roles');
const sitemapQuery = require('./sitemap');

const $env = process.env;

const Context = (
  $id: IdService,
  $logger: LoggerService,
  $security: SecurityService,
  $database: Promise<WhpptDatabase>,
  $config: ConfigService,
  $hosting: Promise<HostingConfig>,
  $email: EmailServiceConstructor,
  $storage: StorageService,
  $gallery: GalleryService,
  $image: ImageService,
  $file: FileService,
  apiKey: string,
  $auspost: AusPostService,
  $xero: XeroService
) => {
  return Promise.resolve().then(() => {
    // TODO: Support other databases. Currently only Mongo is supported and we use it directly here.
    return $database.then(database => {
      const $fullUrl = (slug: string) => `${$env.BASE_URL}/${slug}`;

      const _context = {
        $id,
        $logger,
        $image,
        $file,
        $security,
        $xero,
        $mongo: database as WhpptMongoDatabase,
        $database,
        $hosting,
        $salesForce: SalesForce(),
        $aws: $storage,
        $storage,
        $modules: $config.runtime.modules,
        $pageTypes: $config.runtime.pageTypes,
        $fullUrl,
        $sitemap: {
          filter: sitemapQuery({
            $mongo: database,
            $pageTypes: $config.runtime.pageTypes,
            $fullUrl,
          }),
        },
        $roles: {
          validate: ValidateRoles({ $mongo: database, $env }),
          save: saveRole({ $id, $mongo: database }),
          isGuest: isGuest({ $mongo: database }),
        },
        $identity: Identity(database),
        $env,
        $publishing: {
          onPublish: $config.runtime.onPublish,
          onUnPublish: $config.runtime.onUnPublish,
        },
        EventSession: EventSession({} as ContextType),
        useService: <T>(name: string) =>
          _context[name] ? (_context[name] as T) : undefined,
        apiKey,
      } as ContextType;

      _context.$unleashed = Unleashed(_context);
      _context.$gallery = $gallery;
      _context.CreateEvent = CreateEvent;

      forEach($config.runtime.services, (serviceConstructor, serviceName) => {
        _context[`$${serviceName}`] = serviceConstructor(_context);
      });
      return $email(_context).then(_email => {
        return $auspost(_context).then(_auspost => {
          return { ..._context, $email: _email, $auspost: _auspost };
        });
      });
    });
  });
};

export default Context;
export { Context };
