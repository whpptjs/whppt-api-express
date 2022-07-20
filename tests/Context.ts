import sinon from 'sinon';
import { ContextType } from '../src/context';

const uniqid = require('uniqid');

export type TestContextConstructor = (args: { $id?: any; $mongo?: any; $roles?: { validate: (user: any, roles: any[]) => Promise<void> }; [key: string]: any }) => ContextType;
export const TestContext: TestContextConstructor = args => ({
  $id: args.$id ? args.$id : () => uniqid.process(),
  $mongo: args.$mongo || {
    $save: sinon.fake.resolves({}),
  },
  $logger: args.$logger,
  $image: args.$image,
  $file: args.$file,
  $security: args.$security,
  $modules: args.$modules,
  $pageTypes: args.$pageTypes,
  $fullUrl: args.$fullUrl,
  $sitemap: args.$sitemap,
  $roles: args.$roles || {
    validate: () => Promise.resolve(),
  },
  $env: args.$env,
  $publishing: args.$publishing,
  $email: args.$email,
});
