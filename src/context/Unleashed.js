const axios = require('axios');
const CryptoJS = require('crypto-js');

module.exports = context => {
  const _client = axios.create({
    baseURL: process.env.UNLEASHED_BASE_URL,
    timeout: 5000,
    headers: {
      Accept: 'application/json',
      'api-auth-id': process.env.UNLEASHED_API_ID,
      'Content-Type': 'application/json',
    },
  });

  return {
    $get: (path, urlParam = '') => {
      const hash = CryptoJS.HmacSHA256(urlParam, process.env.UNLEASHED_API_KEY);
      const hash64 = CryptoJS.enc.Base64.stringify(hash);
      _client.defaults.headers['api-auth-signature'] = hash64;

      return _client
        .get(path, { timeout: 10000 })
        .then(({ data }) => data)
        .catch(err => {
          context.$logger.error(err);
          throw err;
        });
    },
    $post: (path, args, urlParam = '') => {
      const hash = CryptoJS.HmacSHA256(urlParam, process.env.UNLEASHED_API_KEY);
      const hash64 = CryptoJS.enc.Base64.stringify(hash);
      _client.headers['api-auth-signature'] = hash64;

      return _client
        .post(path, args)
        .then(({ data }) => data)
        .catch(err => {
          context.$logger.error(JSON.stringify(err));
          context.$logger.error(JSON.stringify(err.DETAILS));
          throw err;
        });
    },
    $put: (path, args, urlParam = '') => {
      const hash = CryptoJS.HmacSHA256(urlParam, process.env.UNLEASHED_API_KEY);

      const hash64 = CryptoJS.enc.Base64.stringify(hash);
      _client.headers['api-auth-signature'] = hash64;

      return _client
        .put(path, args)
        .then(({ data }) => data)
        .catch(err => {
          context.$logger.error(JSON.stringify(err));
          context.$logger.error(JSON.stringify(err.DETAILS));
          context.$logger.error('Error in PUT: ', path);
          throw err;
        });
    },
    $getUnleashedTrackingDetails: () => {
      const hash = CryptoJS.HmacSHA256('', process.env.UNLEASHED_API_KEY);
      const hash64 = CryptoJS.enc.Base64.stringify(hash);
      _client.defaults.headers['api-auth-signature'] = hash64;

      return _client
        .get('SalesOrderGroups', { timeout: 10000 })
        .then(({ Items: salesGroups }) => {
          return _client
            .get('Salespersons', { timeout: 10000 })
            .then(({ salesPeople }) => {
              return {
                salesGroups,
                salesPeople,
              };
            });
        })
        .catch(err => {
          context.$logger.error(err);
          throw err;
        });
    },
  };
};
