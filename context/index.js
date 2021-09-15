const { forEach, map } = require('lodash');
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

module.exports = (options = {}) => {
  options.modules = options.modules || {};
  options.services = options.services || {};

  const pageTypeCollections = options.pageTypes ? map(options.pageTypes, pageType => (pageType.collection && pageType.collection.name) || pageType.key) : [];
  const collections = ['dependencies', ...pageTypeCollections];

  return Promise.all([Mongo({ $logger }, collections)]).then(([$mongo]) => {
    const $pageTypes = options.pageTypes;
    const $fullUrl = slug => `${$env.BASE_URL}/${slug}`;

    const $modules = loadModules().then(modules => ({ ...modules, ...options.modules }));

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
    };

    _context.$email = Email(_context);

    forEach(options.services, (serviceValue, serviceName) => {
      _context[`$${serviceName}`] = serviceValue(_context);
    });

    return _context;
  });
};
