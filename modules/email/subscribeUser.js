const axios = require('axios');

const auth = process.env.CREATESEND_API_KEY ? Buffer.from(process.env.CREATESEND_API_KEY).toString('base64') : '';

const axiosInstance = axios.create({
  headers: {
    Authorization: `Basic ${auth}`,
  },
});

module.exports = {
  exec({}, { email, listId }) {
    console.log('exec -> listId', listId);
    console.log('exec -> email', email);
    return axiosInstance
      .post(`https://api.createsend.com/api/v3.2/subscribers/${listId}.json`, {
        EmailAddress: email,
        ConsentToTrack: 'No',
      })
      .then(res => {
        console.log('exec -> res', res);
      })
      .catch(err => {
        console.log('exec -> err', err);
      });
  },
};
