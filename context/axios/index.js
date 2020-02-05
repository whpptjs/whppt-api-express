const axios = require('axios');
const _axios = axios.create();

module.exports = {
  $get(path) {
    return _axios.get(path).then(({ data }) => {
      return data;
    });
  },
};
