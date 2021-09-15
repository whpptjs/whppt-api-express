const { get } = require('lodash');

const config = require(process.cwd() + '/whppt.config.js');

module.exports = {
  exec({ $mongo: { $db } }, { domainId }) {
    if (!domainId || domainId === 'undefined') return Promise.reject({ status: 500, message: 'Error: no domain found' });
    const query = { _id: `nav_${domainId}`, domainId };

    return $db
      .collection('site')
      .findOne(query)
      .then(nav => {
        if (!nav) {
          const defaultNav = get(config, 'defaults.nav');
          return { ...defaultNav, _id: `nav_${domainId}`, domainId };
        }
        return nav;
      });
  },
};
