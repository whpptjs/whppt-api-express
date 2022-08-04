const sinon = require('sinon');
const callModule = require('./callModule');

test('callModule_missingModule', () => {
  const context = {
    $modules: Promise.resolve({}),
    CreateEvent: () => sinon.fake(),
  };

  return callModule(context, 'test', '', {}, { user: {} }).catch(errResponse => {
    expect(errResponse.status).toEqual(404);
    expect(errResponse.error.message).toBe('Could not find Module. test');
  });
});

test('callModule_missingAction', () => {
  const test = {};
  const context = {
    $modules: Promise.resolve({ test }),
    CreateEvent: () => sinon.fake(),
  };

  return callModule(context, 'test', 'get', {}, { user: {} }).catch(errResponse => {
    expect(errResponse.status).toEqual(404);
    expect(errResponse.error.message).toBe('Could not find Action. test/get');
  });
});

test('callModule_withoutAuthorise_handleError', () => {
  const test = { get: { exec: sinon.stub() } };
  test.get.exec.rejects(new Error('testing'));

  const context = {
    $modules: Promise.resolve({ test }),
    CreateEvent: () => sinon.fake(),
  };

  return callModule(context, 'test', 'get', {}, { user: {} }).catch(response => {
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
    CreateEvent: () => sinon.fake(),
  };

  return callModule(context, 'test', 'get', {}, { user: {} }).catch(response => {
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
    CreateEvent: () => sinon.fake(),
  };

  return callModule(context, 'test', 'get', {}, { user: {} }).catch(response => {
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
    CreateEvent: () => sinon.fake(),
  };

  return callModule(context, 'test', 'get', {}, { user: {} }).catch(response => {
    expect(response.status).toBe(404);
    expect(response.error.message).toBe('Error executing Module: test/get');
    expect(test.get.authorise.called).toBeTruthy();
  });
});

test('callModule_includeReqToAuthorise', () => {
  const test = { get: { authorise: sinon.fake.resolves(), exec: sinon.fake.resolves('testing') } };

  const context = {
    $logger: { error: sinon.fake() },
    CreateEvent: () => sinon.fake(),
    $modules: Promise.resolve({ test }),
  };

  const request = { testing: true, user: {} };

  return callModule(context, 'test', 'get', {}, request).then(response => {
    const [, , exec_req_param] = test.get.exec.getCall(0).args;
    const [, , auth_req_param] = test.get.authorise.getCall(0).args;

    expect(response).toBe('testing');
    expect(auth_req_param).toBe(request);
    expect(exec_req_param).toBe(request);
  });
});

test('callModule_fromDefaultExport', () => {
  const test = {
    get: {
      default: { exec: sinon.fake.resolves('testing') },
    },
  };

  const context = {
    $logger: { error: sinon.fake() },
    CreateEvent: () => sinon.fake(),
    $modules: Promise.resolve({ test }),
  };

  const params = {};
  const req = { user: {} };

  return callModule(context, 'test', 'get', params, req).then(response => {
    const [arg_exec_context, arg_exec_params] = test.get.default.exec.getCall(0).args;

    expect(response).toBe('testing');
    expect(JSON.stringify(arg_exec_context)).toBe(JSON.stringify({ ...context, createEvent: () => sinon.fake() }));
    expect(arg_exec_params).toBe(params);
  });
});
