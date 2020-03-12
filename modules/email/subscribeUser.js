const axios = require('axios');

/* TODO: Jake said he's going to move this out of whppt! */
const auth = process.env.CREATESEND_API_KEY ? Buffer.from(process.env.CREATESEND_API_KEY).toString('base64') : '';

const axiosInstance = axios.create({
  headers: {
    Authorization: `Basic ${auth}`,
  },
});

module.exports = {
  exec({}, { email, listId }) {
    assert(auth, 'Missing Credentials');

    return axiosInstance
      .post(`https://api.createsend.com/api/v3.2/subscribers/${listId}.json`, {
        EmailAddress: email,
        ConsentToTrack: 'No',
      })
      .then(() => {})
      .catch(err => {
        throw err;
      });
  },
};
