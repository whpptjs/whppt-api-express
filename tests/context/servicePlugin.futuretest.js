jest.mock('../../context/id');
jest.mock('../../context/logger');
jest.mock('../../context/security');
jest.mock('../../context/mongo');
jest.mock('../../context/modules/loadModules');
jest.mock('../../context/image');
jest.mock('../../context/file');
jest.mock('../../context/aws');
jest.mock('../../context/email');
jest.mock('../../context/sitemap');
jest.mock('../../context/roles');

const sinon = require('sinon');
const Context = require('../../src/context');
const loadModules = require('../../src/context/modules/loadModules');
const Mongo = require('../../src/context/mongo');

describe('Service plugin to context', () => {
  test.skip('supplying a service should register the service in the context', () => {
    Mongo.mockReturnValue(Promise.resolve());
    loadModules.mockReturnValue(Promise.resolve({}));

    const testService = sinon.stub();

    const options = { services: { testService } };
    return Context(options).then(context => {
      expect(context.$testService === testService);
      expect(testService.calledWith(context));
    });
  });
});
