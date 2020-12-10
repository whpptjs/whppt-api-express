jest.mock('../../context/id');
jest.mock('../../context/logger');
jest.mock('../../context/security');
jest.mock('../../context/mongo');
// jest.mock('../../context/modules/loadModules');
jest.mock('../../context/image');
jest.mock('../../context/file');
jest.mock('../../context/aws');
jest.mock('../../context/email');
jest.mock('../../context/sitemap');
jest.mock('../../context/roles');

const $id = require('../../context/id');
const $logger = require('../../context/logger');
const Security = require('../../context/security');
const Mongo = require('../../context/mongo');
// const loadModules = require('../../context/modules/loadModules');
const Image = require('../../context/image');
const File = require('../../context/file');
const $aws = require('../../context/aws');
const Email = require('../../context/email');
const sitemapQuery = require('../../context/sitemap');
const { ValidateRoles, saveRole } = require('../../context/roles');

const Context = require('../../context');
const sinon = require('sinon');

describe('Service plugin to context', () => {
  test('supplying a service should register the service in the context', () => {
    Mongo.mockReturnValue(Promise.resolve());
    // loadModules.mockReturnValue(Promise.resolve({}));

    const testService = sinon.stub();

    const options = { services: { testService } };
    return Context(options).then(context => {
      expect(context.$testService === testService);
      expect(testService.calledWith(context));
    });
  });
});
