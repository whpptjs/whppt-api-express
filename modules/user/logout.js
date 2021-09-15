// const assert = require('assert');
// const { omit } = require('lodash');

// TODO: Implement when recording user logouts
module.exports = {
  // exec({ $mongo, $security }, { user }) {
  // return Promise.resolve();
  // return $mongo.then(({ db }) => {
  //   return db
  //     .collection(COLLECTIONS.USERS)
  //     .findOne(
  //       {
  //         $or: [{ username: identifier }, { email: identifier }],
  //       },
  //       { username: true, firstname: true, lastname: true, email: true, roles: true, password: true }
  //     )
  //     .then(user => {
  //       if (!user) throw new Error('Something went wrong. Could not log in.');
  //       return $security.compare(password, user.password).then(passwordMatches => {
  //         if (passwordMatches) return { token: $security.createToken(omit(user, ['password'])) };
  //         throw new Error('Something went wrong. Could not log in.');
  //       });
  //     });
  // });
  // },
};
