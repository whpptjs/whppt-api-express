/* @deprecated 2.0 */
// const axios = require('axios');
//
// const auth = Buffer.from(process.env.CREATESEND_API_KEY || '').toString('base64');
//
// const axiosInstance = axios.create({
//   headers: {
//     Authorization: `Basic ${auth}`,
//   },
// });
//
// module.exports = {
//   exec({}, { email, listId }) {
//     return axiosInstance
//       .post(`https://api.createsend.com/api/v3.2/subscribers/${listId}.json`, {
//         EmailAddress: email,
//         ConsentToTrack: 'No',
//       })
//       .catch(err => {
//         return err && err.response && err.response.data;
//       });
//   },
// };
