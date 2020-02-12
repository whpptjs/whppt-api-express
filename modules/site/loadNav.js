const assert = require('assert');

module.exports = {
  exec({ $mongo: { $db } }) {
    return $db
      .collection('site')
      .findOne({ _id: 'nav' })
      .then(nav => {
        if (!nav) return { _id: 'nav', menus: [] };
        return nav;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
};
