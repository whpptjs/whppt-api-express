const assert = require('assert');
const { unPublishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = {
  exec({ $mongo: { $unpublish } }, { _id }) {
    assert(_id, 'A Page Id must be provided.');

    return $unpublish('pages', _id).then(() => {
      if (!unPublishCallBack) return page;
      return unPublishCallBack(page).then(() => page);
    });
  },
};
