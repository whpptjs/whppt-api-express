// callHandler can come into here
const callHandler = require('./callHandler');

module.exports = (context, mod, handlerName, params) => {
  const { $modules } = context;
  return $modules.then(modules => {
    const module = modules[mod];
    if (!module)
      return Promise.reject({
        status: 404,
        error: new Error(`Could not find Module. ${mod}`),
      });

    const handler = module[handlerName];
    if (!handler)
      return Promise.reject({
        status: 404,
        error: new Error(`Could not find Action. ${mod}/${handlerName}`),
      });

    return callHandler(context, handler, params);
  });
};
