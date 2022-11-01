const loadGlobModules = require('require-glob');
import { WhpptModule } from '../../modules/HttpModule';
import * as contact from '../../modules/contact';
import * as order from '../../modules/order';
import * as member from '../../modules/member';

const modulePromise = loadGlobModules(
  [
    '../../modules/**/*.js',
    '!../../modules/contact/**/*.js',
    '!../../modules/order/**/*.js',
    '!../../modules/member/**/*.js',
    '!../../modules/callModule.js',
    '!../../modules/callModule.test.js',
  ],
  { cwd: __dirname }
);

export type LoadModules = (configModules: { [key: string]: WhpptModule }) => Promise<{
  [key: string]: WhpptModule;
}>;

export const loadModules: LoadModules = (configModules: { [key: string]: WhpptModule }) =>
  modulePromise.then((modules: { [key: string]: WhpptModule }) => {
    return {
      ...modules,
      ...contact,
      ...order,
      ...member,
      ...configModules,
    };
  });
