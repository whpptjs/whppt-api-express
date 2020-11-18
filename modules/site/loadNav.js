const { get } = require('lodash');
const assert = require('assert');
const config = require(process.cwd() + '/whppt.config.js');

module.exports = {
  exec({ $mongo: { $db } }, { domainId }) {
    const query = { _id: domainId && domainId !== 'undefined' ? `nav_${domainId}` : 'nav' };

    return $db
      .collection('site')
      .findOne(query)
      .then(nav => {
        if (!nav) {
          const defaultNav = get(config, 'defaults.nav');
          return { ...defaultNav, _id: domainId && domainId !== 'undefined' ? `nav_${domainId}` : 'nav' };
        }
        return nav;
      })
      .catch(err => {
        throw err;
      });
  },
};
