import { genericPageType, PageType } from './PageType';
import { WhpptModule } from '../../modules/HttpModule';
import { loadModules } from './loadModules';
import { buildCollections } from './buildCollections';
import { LoggerService } from '../Logger';
import { ConfigMiddleware } from './middleware';

export * from './PageType';

export type WhpptSecurityConfig = {
  provider: string;
  jwt?: { secret: string; issuer: string; audience: string };
};

export type WhpptConfig = {
  security: WhpptSecurityConfig;
  modules: { [key: string]: WhpptModule };
  collections: string[];
  // services: any[];
  pageTypes?: PageType[];
  disablePublishing?: boolean;
  /**
   * @deprecated this options should not be used. The various routers will use their own prefixes.
   */
  apiPrefix?: string;
};

export type RuntimeConfig = {
  collections: string[];
  pageTypes: PageType[];
  modules: { [key: string]: WhpptModule };
  // TODO: Add in the services extension back in
  // services: any;
  disablePublishing: boolean;
};

export type ConfigServiceFactory = (
  logger: LoggerService,
  config: WhpptConfig
) => ConfigService;

export type ConfigService = {
  config: RuntimeConfig;
  middleware: ConfigMiddleware;
};

export const ConfigService: ConfigServiceFactory = (logger, config) => {
  const loadModulesPromise = loadModules(config.modules || {});
  const middleware = ConfigMiddleware(logger, loadModulesPromise);
  const _config: RuntimeConfig = {
    modules: {},
    pageTypes: config.pageTypes || [genericPageType],
    // services: config.services || {},
    collections: buildCollections(config),
    disablePublishing: config.disablePublishing || false,
  };
  loadModulesPromise.then(modules => (_config.modules = modules));
  return { config: _config, middleware };
};
