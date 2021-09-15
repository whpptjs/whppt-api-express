const sinon = require('sinon');
const callModule = require('./callModule');

test('callModule_missingModule', () => {
  const context = {
    $modules: Promise.resolve({}),
  };

  return callModule(context, 'test').catch(errResponse => {
    expect(errResponse.status).toEqual(404);
    expect(errResponse.error.message).toBe('Could not find Module. test');
  });
});

test('callModule_missingAction', () => {
  const test = {};
  const context = {
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').catch(errResponse => {
    expect(errResponse.status).toEqual(404);
    expect(errResponse.error.message).toBe('Could not find Action. test/get');
  });
});

test('callModule_withoutAuthorise_handleError', () => {
  const test = { get: { exec: sinon.stub() } };
  test.get.exec.rejects(new Error('testing'));

  const context = {
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').catch(response => {
    expect(response.status).toEqual(500);
    expect(response.error.message).toBe(`Error executing Module: test/get`);
  });
});

test('callModule_withAuthorise_handleError', () => {
  const test = { get: { authorise: sinon.stub(), exec: sinon.stub() } };
  test.get.authorise.resolves();
  test.get.exec.rejects(new Error('testing'));

  const context = {
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').catch(response => {
    expect(response.status).toBe(500);
    expect(response.error.message).toBe(`Error executing Module: test/get`);
    expect(test.get.authorise.called).toBeTruthy();
  });
});

test('callModule_withoutAuthorise_handleError404fromMongo', () => {
  const test = { get: { exec: sinon.stub() } };
  test.get.exec.rejects({ status: 404, message: 'mongo error' });

  const context = {
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').catch(response => {
    expect(response.status).toBe(404);
    expect(response.error.message).toBe('Error executing Module: test/get');
  });
});

test('callModule_withAuthorise_handleError404fromMongo', () => {
  const test = { get: { authorise: sinon.stub(), exec: sinon.stub() } };

  test.get.authorise.resolves();
  test.get.exec.rejects({ status: 404 });

  const context = {
    $modules: Promise.resolve({ test }),
  };

  return callModule(context, 'test', 'get').catch(response => {
    expect(response.status).toBe(404);
    expect(response.error.message).toBe('Error executing Module: test/get');
    expect(test.get.authorise.called).toBeTruthy();
  });
});

test('callModule_withoutAuthorise', () => {
  const test = { get: { exec: sinon.fake.resolves('testing') } };

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };

  const params = {};

  return callModule(context, 'test', 'get', params).then(response => {
    const [arg_context, arg_params] = test.get.exec.getCall(0).args;

    expect(response).toBe('testing');
    expect(arg_context).toBe(context);
    expect(arg_params).toBe(params);
  });
});

test('callModule_withAuthorise', () => {
  const test = { get: { authorise: sinon.fake.resolves(), exec: sinon.fake.resolves('testing') } };

  const context = {
    $logger: { error: sinon.fake() },
    $modules: Promise.resolve({ test }),
  };

  const params = {};

  return callModule(context, 'test', 'get', params).then(response => {
    const [arg_exec_context, arg_exec_params] = test.get.exec.getCall(0).args;
    const [arg_auth_context, arg_auth_params] = test.get.authorise.getCall(0).args;

    expect(response).toBe('testing');
    expect(arg_exec_context).toBe(context);
    expect(arg_exec_params).toBe(params);
    expect(arg_auth_context).toBe(context);
    expect(arg_auth_params).toBe(params);
  });
});
