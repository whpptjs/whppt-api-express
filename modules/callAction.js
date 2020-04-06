module.exports = (context, action, params) => {
  const { $logger } = context;
  if (!action.authorise) {
    return action.exec(context, params).catch(err => {
      $logger.error(err);
      if (err.message && err.message === 404) return { status: 404, error: err };
      return { status: 500, error: err };
    });
  }

  return action.authorise(context, params).then(() => {
    return action.exec(context, params).catch(err => {
      $logger.error(err);
      if (err.message && err.message === 404) return { status: 404, error: err };
      return { status: 500, error: err };
    });
  });
};
