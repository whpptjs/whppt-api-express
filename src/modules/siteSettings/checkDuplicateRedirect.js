const assert = require('assert');
const { toLower } = require('lodash');

module.exports = {
  exec({ $mongo: { $db } }, { redirect }) {
    assert(redirect, 'Please provide a valid redirect.');
    assert(redirect.to, 'Redirect must contain a valid "to" property.');
    assert(redirect.from, 'Redirect must contain a valid "from" property.');
    assert(
      redirect.from !== redirect.to,
      'The "to" property cannot be the same as the "from" property.'
    );
    assert(redirect.domainId, 'Redirect must contain a valid "domainId" property.');

    const { to, from, domainId } = redirect;

    return $db
      .collection('redirects')
      .findOne({ to, from: toLower(from), domainId })
      .then(result => {
        return !!result;
      })
      .catch(err => {
        throw err;
      });
  },
};
