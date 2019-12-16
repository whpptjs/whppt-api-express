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

    if (!a.authorise)
      return a.exec(context, params).catch(err => {
        $logger.error(err);
        if (err.message && err.message === 404) return { status: 404, error: err };
        return { status: 500, error: err };
      });

    return a.authorise(context, params).then(() =>
      a.exec(context, params).catch(err => {
        $logger.error(err);
        if (err.message && err.message === 404) return { status: 404, error: err };
        return { status: 500, error: err };
      })
    );
  });
};
