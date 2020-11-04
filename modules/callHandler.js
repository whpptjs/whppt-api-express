module.exports = (context, messageHandler, params) => {
  const { $logger } = context;
  if (!messageHandler.authorise) {
    return messageHandler.exec(context, params).catch(err => {
      $logger.error(err);
      if (err.message && err.message === 404) return { status: 404, error: err };
      return { status: 500, error: err };
    });
  }

  return messageHandler
    .authorise(context, params)
    .then(() => {
      return messageHandler.exec(context, params).catch(err => {
        $logger.error(err);
        if (err.message && err.message === 404) return { status: 404, error: err };
        return { status: 500, error: err };
      });
    })
    .catch(err => {
      return { status: err.status || 401, error: err.message };
    });
};
