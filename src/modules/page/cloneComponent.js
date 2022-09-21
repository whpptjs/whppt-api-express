const assert = require('assert');
const { get } = require('lodash');

module.exports = {
  exec(
    { $mongo: { $db, $save } },
    { pageId, collection, cloneInto = 'contents', component }
  ) {
    assert(pageId, 'Please provide a pageId');
    assert(collection, 'Please provide a collection');
    assert(component, 'Please provide a component');

    return $db
      .collection(collection)
      .findOne({ _id: pageId })
      .then(page => {
        const content = get(page, cloneInto);

        assert(
          content,
          `No property ${cloneInto} found on page ${pageId} in collection ${collection}`
        );

        content.push(component);

        return $save(collection, page);
      });
  },
};
