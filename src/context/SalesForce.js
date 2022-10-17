const axios = require('axios');

module.exports = () => {
  const baseURL = 'https://hentleyfarm--uat.my.salesforce.com/';

  const _client = axios.create({
    baseURL: process.env.SALESFORCE_BASE_URL || baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'X-PrettyPrint': 1,
    },
  });
  return {
    $Oauth: () => {
      const consumerkey = process.env.SALESFORCE_CONSUMER_KEY;
      const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
      const username = process.env.SALESFORCE_USERNAME;
      const password = process.env.SALESFORCE_PASSWORD;

      const queryString = `grant_type=password&client_id=${consumerkey}&client_secret=${clientSecret}&username=${username}&password=${password}`;
      return _client
        .post(`services/oauth2/token?${queryString}`)
        .then(({ data }) => {
          return data && data.access_token;
        })
        .catch(err => {
          return Promise.reject({ ...err, status: 500 });
        });
    },
    $post: (path, args) =>
      _client
        .post(path, args)
        .then(({ data }) => data)
        .catch(err => {
          return Promise.reject({ ...err, status: 500 });
        }),
    $put: (path, args) =>
      _client
        .put(path, args)
        .then(({ data }) => data)
        .catch(err => {
          return Promise.reject({ ...err, status: 500 });
        }),
    $upsert: (token, id, args) => {
      _client.defaults.headers.Authorization = `Bearer ${token}`;

      const _data = JSON.stringify(args);
      const path = `services/data/v53.0/sobjects/Product2/Product_External_ID__c/${id}`;
      return _client
        .patch(path, _data)
        .then(({ data }) => data)
        .catch(err => {
          return Promise.reject({ ...err, status: 500 });
        });
    },
  };
};
