import { PageType } from './context/Context';

export type WhpptSecurityConfig = {
  provider: string;
  jwt?: { secret: string; issuer: string; audience: string };
};

export type WhpptConfig = {
  security: WhpptSecurityConfig;
  disablePublishing?: boolean;
  /**
   * @deprecated this options should not be used. The various routers will use their own prefixes.
   */
  apiPrefix?: string;
  pageTypes?: PageType[];
};
