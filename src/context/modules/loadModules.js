const loadModules = require('require-glob');

const modulePromise = loadModules(
  [
    '../../modules/**/*.js',
    '../../modules/**/*.ts',
    '!../../modules/callModule.js',
    '!../../modules/callModule.test.js',
  ],
  { cwd: __dirname }
);

module.exports = () => modulePromise;
