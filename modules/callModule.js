const callAction = require('./callAction');

module.exports = (context, mod, action, params) => {
  const { $logger, $modules } = context;
  return $modules.then(modules => {
    const actions = modules[mod];
    if (!actions)
      return Promise.reject({
        status: 404,
        error: new Error(`Could not find Module. ${mod}`),
      });

    const a = actions[action];
    if (!a)
      return Promise.reject({
        status: 404,
        error: new Error(`Could not find Action. ${mod}/${action}`),
      });

    return callAction(context, a, params);
  });
};
