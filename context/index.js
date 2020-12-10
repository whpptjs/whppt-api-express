const $id = require('./id');
const $logger = require('./logger');
const Security = require('./security');
const Mongo = require('./mongo');
const loadModules = require('./modules/loadModules');
const Image = require('./image');
const File = require('./file');
const $aws = require('./aws');
const Email = require('./email');
const sitemapQuery = require('./sitemap');
const { ValidateRoles, saveRole } = require('./roles');

const $env = process.env;
$env.DRAFT = 'true';

module.exports = (options = {}) => {
  options.modules = options.modules || {};
  options.services = options.services || {};

  return Promise.all([Mongo({ $logger })]).then(([$mongo]) => {
    const $pageTypes = options.pageTypes;
    const $fullUrl = slug => `${process.env.BASE_URL}/${slug}`;

    const _context = {
      $id,
      $logger,
      $image: Image({ $logger, $mongo, $aws, $id, disablePublishing: options.disablePublishing }),
      $file: File({ $logger, $mongo, $aws, $id, disablePublishing: options.disablePublishing }),
      $security: Security({ $logger, $id, config: options }),
      $mongo,
      $modules: loadModules.then(modules => ({ ...modules, ...options.modules })),
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
