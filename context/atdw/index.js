const axios = require('axios');
const encoding = require('encoding');

const atdw = axios.create();

module.exports = {
  $get(path) {
    return atdw.get(path, { responseType: 'arraybuffer' }).then(({ data }) => {
      // ATDW API response encoding is UTF-16LE
      // Use encoding.function to convert to UTF-8 to satisfy Axios.
      return JSON.parse(encoding.convert(data, 'UTF-8', 'UTF-16LE').toString());
    });
  },
};
