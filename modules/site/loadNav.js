const { get } = require('lodash');
const assert = require('assert');
const config = require(process.cwd() + '/whppt.config.js');

module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('site')
      .findOne({ _id: 'nav' })
      .then(nav => {
        if (!nav) {
          const defaultFooter = get(config, 'defaults.nav');
          return { ...defaultFooter, _id: 'nav' };
        }
        return nav;
      })
      .catch(err => {
        throw err;
      });
  },
};
