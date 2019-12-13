const AggRoot = require('../../AggRoot');
const COLLECTIONS = require('../../COLLECTIONS');

class User extends AggRoot {
  constructor({ _id, username, name, email } = {}) {
    super({ _id });
    this.username = username;
    this.name = name;
    this.email = email;
  }
}

User._collection = COLLECTIONS.USERS;

module.exports = User;
