import { forEach, map } from 'lodash';
import { ContextArgs, ContextType, PageType } from './Context';
import Gallery from './gallery';

const $aws = require('./aws');
const Email = require('./email');
const File = require('./file');
const $id = require('./id');
const Image = require('./image');
const $logger = require('./logger');
const loadModules = require('./modules/loadModules');
const Mongo = require('./mongo');
const { ValidateRoles, saveRole } = require('./roles');
const Security = require('./security');
const sitemapQuery = require('./sitemap');

const $env = process.env;

const voidCallback = () => {};

const genericPageType = {
  name: 'page',
  label: 'Generic',
  collection: { name: 'pages' },
} as PageType;

export default (options: ContextArgs = { disablePublishing: false }) => {
  options.modules = options.modules || {};
  options.services = options.services || {};

  const $pageTypes = options.pageTypes && options.pageTypes.length ? options.pageTypes : [genericPageType];
  const pageTypeCollections = map($pageTypes, pageType => (pageType.collection && pageType.collection.name) || pageType.key);
  const pageTypeHistoryCollections = map(pageTypeCollections, pageTypeName => pageTypeName + 'History');

  const collections = ['dependencies', ...pageTypeCollections, ...pageTypeHistoryCollections];

  return Promise.all([Mongo({ $logger, $id }, collections)]).then(([$mongo]) => {
    const $fullUrl = (slug: string) => `${$env.BASE_URL}/${slug}`;

    const $modules = loadModules().then((modules: any) => ({ ...modules, ...options.modules }));

    const _context = {
      $id,
      $logger,
      $image: Image({ $logger, $mongo, $aws, $id, disablePublishing: options.disablePublishing }),
      $file: File({ $logger, $mongo, $aws, $id, disablePublishing: options.disablePublishing }),
      $security: Security({ $logger, $id, config: options }),
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
      },
      $env,
      $publishing: {
        onPublish: options.onPublish || voidCallback,
        onUnPublish: options.onUnPublish || voidCallback,
      },
    } as ContextType;

    _context.$email = Email(_context);
    _context.$gallery = Gallery({ ..._context, $aws });

    forEach(options.services, (serviceValue, serviceName) => {
      _context[`$${serviceName}`] = serviceValue(_context);
    });

    return _context;
  });
};
