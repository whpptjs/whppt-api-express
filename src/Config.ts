import { PageType } from './context/Context';

export type WhpptSecurityConfig = {
  provider: string;
  jwt?: { secret: string; issuer: string; audience: string };
};

export type WhpptConfig = {
  security: WhpptSecurityConfig;
  /**
   * @deprecated this options should not be used. The various routers will use their own prefixes.
   */
  disablePublishing?: boolean;
  apiPrefix?: string;
  pageTypes?: PageType[];
};
