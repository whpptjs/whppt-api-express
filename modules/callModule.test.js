const test = require('ava');
const sinon = require('sinon');
const callModule = require('./callModule');

test('callModule_missingModule', t => {
  const context = {
    $modules: Promise.resolve({}),
  };

  return callModule(context, 'test').catch(errResponse => {
    t.is(errResponse.status, 404);
    t.is(errResponse.error.message, 'Could not find Module. test');
  });
});

test('callModule_missingAction', t => {
  const test = {};
  const context = {
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').catch(errResponse => {
    t.is(errResponse.status, 404);
    t.is(errResponse.error.message, 'Could not find Action. test/get');
  });
});

test('callModule_withoutAuthorise_handleError', t => {
  const test = { get: { exec: sinon.stub() } };
  test.get.exec.rejects(new Error('testing'));

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').then(response => {
    const logged = context.$logger.error.getCall(0).args[0];
    t.is(logged.message, 'testing');
    t.is(response.status, 500);
    t.is(response.error.message, 'testing');
  });
});

test('callModule_withAuthorise_handleError', t => {
  const test = { get: { authorise: sinon.stub(), exec: sinon.stub() } };
  test.get.authorise.resolves();
  test.get.exec.rejects(new Error('testing'));

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').then(response => {
    const logged = context.$logger.error.getCall(0).args[0];
    t.is(logged.message, 'testing');
    t.is(response.status, 500);
    t.is(response.error.message, 'testing');
    t.truthy(test.get.authorise.called);
  });
});

test('callModule_withoutAuthorise_handleError404fromMongo', t => {
  const test = { get: { exec: sinon.stub() } };
  test.get.exec.rejects({ message: 404 });

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').then(response => {
    const logged = context.$logger.error.getCall(0).args[0];
    t.is(logged.message, 404);
    t.is(response.status, 404);
    t.is(response.error.message, 404);
  });
});

test('callModule_withAuthorise_handleError404fromMongo', t => {
  const test = { get: { authorise: sinon.stub(), exec: sinon.stub() } };
  test.get.authorise.resolves();
  test.get.exec.rejects({ message: 404 });

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').then(response => {
    const logged = context.$logger.error.getCall(0).args[0];
    t.is(logged.message, 404);
    t.is(response.status, 404);
    t.is(response.error.message, 404);
    t.truthy(test.get.authorise.called);
  });
});

test('callModule_withoutAuthorise', t => {
  const test = { get: { exec: sinon.fake.resolves('testing') } };

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };
  const params = {};

  return callModule(context, 'test', 'get', params).then(response => {
    const arg_context = test.get.exec.getCall(0).args[0];
    const arg_params = test.get.exec.getCall(0).args[1];
    t.is(response, 'testing');
    t.is(arg_context, context);
    t.is(arg_params, params);
  });
});

test('callModule_withAuthorise', t => {
  const test = { get: { authorise: sinon.fake.resolves(), exec: sinon.fake.resolves('testing') } };

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };
  const params = {};

  return callModule(context, 'test', 'get', params).then(response => {
    const arg_exec_context = test.get.exec.getCall(0).args[0];
    const arg_exec_params = test.get.exec.getCall(0).args[1];
    const arg_auth_context = test.get.authorise.getCall(0).args[0];
    const arg_auth_params = test.get.authorise.getCall(0).args[1];

    t.is(response, 'testing');
    t.is(arg_exec_context, context);
    t.is(arg_exec_params, params);
    t.is(arg_auth_context, context);
    t.is(arg_auth_params, params);
  });
});
