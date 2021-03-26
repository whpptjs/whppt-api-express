const { get } = require('lodash');
const assert = require('assert');
const config = require(process.cwd() + '/whppt.config.js');

module.exports = {
  exec({ $mongo: { $db } }, { domainId }) {
    if (!domainId || domainId === 'undefined') return Promise.reject({ status: 500, message: 'Error: no domain found' });
    const query = { _id: `footer_${domainId}`, domainId };

    return $db
      .collection('site')
      .findOne(query)
      .then(footer => {
        if (!footer) {
          const defaultFooter = get(config, 'defaults.footer');
          return { ...defaultFooter, _id: `footer_${domainId}`, domainId };
        }
        return footer;
      });
  },
};
