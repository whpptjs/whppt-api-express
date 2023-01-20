const loadGlobModules = require('require-glob');
import { WhpptModule } from '../../modules/HttpModule';
import * as contact from '../../modules/contact';
import * as order from '../../modules/order';
import * as member from '../../modules/member';
import * as staff from '../../modules/staff';
import * as tagging from '../../modules/tagging';
import * as delivery from '../../modules/delivery';
import * as membershipTier from '../../modules/membershipTier';
import * as search from '../../modules/search';

const modulePromise = loadGlobModules(
  [
    '../../modules/**/*.js',
    '!../../modules/contact/**/*.js',
    '!../../modules/order/**/*.js',
    '!../../modules/member/**/*.js',
    '!../../modules/delivery/**/*.js',
    '!../../modules/membershipTier/**/*.js',
    '!../../modules/staff/**/*.js',
    '!../../modules/tagging/**/*.js',
    '!../../modules/search/**/*.js',
    '!../../modules/callModule.js',
    '!../../modules/callModule.test.js',
  ],
  { cwd: __dirname }
);

export type LoadModules = (configModules: { [key: string]: WhpptModule }) => Promise<{
  [key: string]: WhpptModule;
}>;

export const loadModules: LoadModules = (configModules: {
  [key: string]: WhpptModule;
}) => {
  return modulePromise.then((modules: { [key: string]: WhpptModule }) => {
    return {
      ...modules,
      ...contact,
      ...order,
      ...delivery,
      ...membershipTier,
      ...member,
      ...staff,
      ...tagging,
      ...search,
      ...configModules,
    };
  });
};
