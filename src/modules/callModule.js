module.exports = (context, mod, handlerName, params, req) => {
  return Promise.resolve().then(() => {
    const { $modules } = context;

    return $modules.then(modules => {
      const module = modules[mod];
      if (!module)
        return Promise.reject({
          status: 404,
          error: new Error(`Could not find Module. ${mod}`),
        });

      const callHandler =
        (module[handlerName] && module[handlerName].default) || module[handlerName];

      if (!callHandler)
        return Promise.reject({
          status: 404,
          error: new Error(`Could not find Action. ${mod}/${handlerName}`),
        });

      const createEvent = context.CreateEvent(req.user);
      const _context = { ...context, createEvent };

      if (!callHandler.authorise) {
        return Promise.resolve()
          .then(() => callHandler.exec(_context, params, req))
          .catch(err => {
            return Promise.reject({
              status: (err && err.status) || 500,
              error: new ModuleExecError(
                err && err.status,
                `Error executing Module: ${mod}/${handlerName}`,
                err
              ),
            });
          });
      }

      return Promise.resolve()
        .then(() => callHandler.authorise(_context, params, req))
        .catch(err =>
          Promise.reject({
            status: 403,
            error: new AuthError(
              `Not Authorised to call Module: ${mod}/${handlerName}`,
              err
            ),
          })
        )
        .then(() => callHandler.exec(_context, params, req))
        .catch(err => {
          return Promise.reject({
            status: (err && err.status) || 500,
            error: new ModuleExecError(
              err && err.status,
              `Error executing Module: ${mod}/${handlerName}`,
              err
            ),
          });
        });
    });
  });
};

function AuthError(message, err) {
  this.name = 'Not Authorised';
  this.message = message;
  this.stack = err.stack;
  this.status = 403;
}
AuthError.prototype = Error.prototype;

function ModuleExecError(status, message, err) {
  this.name = 'Module Exec Error';
  this.message = message;
  this.stack = err.stack;
  this.status = status || 500;
}
ModuleExecError.prototype = Error.prototype;
