module.exports = (context, messageHandler, params) => {
  if (!messageHandler.authorise) {
    return Promise.resolve()
      .then(() => messageHandler.exec(context, params))
      .catch(err => {
        if (err.message && err.message === 404) return Promise.reject({ status: 404, error: err });
        return Promise.reject({ status: 500, error: err });
      });
  }

  // TODO: fix returned error status so its not always 401
  return messageHandler
    .authorise(context, params)
    .then(() => {
      return messageHandler.exec(context, params).catch(err => {
        if (err.message && err.message === 404) return Promise.reject({ status: 404, error: err });

        return Promise.reject({ status: 500, error: err });
      });
    })
    .catch(err => {
      console.log('✨ ~ file: callHandler.js ~ line 22 ~ err', err);
      return Promise.reject({ status: err.status || 401, error: err.message });
    });
};
