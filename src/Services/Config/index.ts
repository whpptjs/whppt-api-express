import { genericPageType, PageType } from './PageType';
import { WhpptModule } from '../../modules/HttpModule';
import { loadModules } from './loadModules';
import { buildCollections } from './buildCollections';
import { LoggerService } from '../Logger';
import { ConfigMiddleware } from './middleware';
import { ContextService } from '../../context/Context';

export * from './PageType';

export type WhpptSecurityConfig = {
  provider: string;
  jwt?: { issuer: string };
};

export type WhpptConfig = {
  security: WhpptSecurityConfig;
  modules?: { [key: string]: WhpptModule };
  collections?: string[];
  services?: { [name: string]: ContextService<any> };
  pageTypes?: PageType[];
  disablePublishing?: boolean;
  onPublish?: (page: any) => void;
  onUnPublish?: (page: any) => void;
  routers?: { path: string; routerFactory: any }[];
  /**
   * @deprecated this options should not be used. The various routers will use their own prefixes.
   */
  apiPrefix?: string;
};

export type RuntimeConfig = {
  collections: string[];
  pageTypes: PageType[];
  modules: { [key: string]: WhpptModule };
  services: { [name: string]: ContextService<any> };
  onPublish: (page: any) => void;
  onUnPublish: (page: any) => void;
};

export type ConfigServiceFactory = (
  logger: LoggerService,
  config: WhpptConfig
) => ConfigService;

export type ConfigService = {
  runtime: RuntimeConfig;
  middleware: ConfigMiddleware;
};

const voidCallback = () => {};

export const ConfigService: ConfigServiceFactory = (logger, config) => {
  const _config: RuntimeConfig = {
    modules: {},
    pageTypes: config.pageTypes || [genericPageType],
    services: config.services || {},
    collections: buildCollections(config),
    onPublish: (!config.disablePublishing && config.onPublish) || voidCallback,
    onUnPublish: (!config.disablePublishing && config.onUnPublish) || voidCallback,
  };

  const loadModulesPromise = loadModules(config.modules || {}).then(modules => {
    _config.modules = modules;
  });
  console.log(
    '🚀 ~ file: index.ts ~ line 66 ~ loadModulesPromise ~ loadModulesPromise',
    loadModulesPromise
  );
  const middleware = ConfigMiddleware(logger, loadModulesPromise);
  return { runtime: _config, middleware };
};
