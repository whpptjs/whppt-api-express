const assert = require('assert');
const { toLower } = require('lodash');

module.exports = {
  exec({ $id, $mongo: { $save } }, { redirect }) {
    assert(redirect, 'Please provide a valid redirect.');
    assert(redirect.to, 'Redirect must contain a valid "to" property.');
    assert(redirect.from, 'Redirect must contain a valid "from" property.');
    assert(redirect.from !== redirect.to, 'The "to" property cannot be the same as the "from" property.');
    assert(redirect.domainId, 'Redirect must contain a valid "domainId" property.');

    const { _id, name, to, from, domainId } = redirect;

    const _redirect = {
      _id: _id || $id(),
      name,
      to,
      from: toLower(from),
      domainId,
    };

    return $save('redirects', _redirect);
  },
};
