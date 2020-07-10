const includes = require('lodash/includes');
const assert = require('assert');

const { publishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = context => {
  const {
    $security,
    $objectTypes,
    $mongo: { $publish, $db, $fetch, $list, $save, $delete, $remove },
    $id,
  } = context;

  const list = function({ params: { type }, query: { showRemoved = false } }) {
    assert(includes($objectTypes, type), `${type} not supported!`);

    return $list(type, showRemoved);
  };

  const get = function({ params: { type, id } }) {
    assert(includes($objectTypes, type), `${type} not supported!`);
    assert(id, 'Id is required');
    return $fetch(type, id);
  };

  const post = function({ body: obj, params: { type } }) {
    console.log(includes($objectTypes, type));
    assert(includes($objectTypes, type), `${type} not supported!`);
    obj._id = obj._id || $id();
    return $save(type, obj).then(() => {
      return $fetch(type, obj._id);
    });
  };

  const del = function({ params: { type, id }, query: { force } }) {
    assert(includes($objectTypes, type), `${type} not supported!`);

    if (force) return $delete(type, id);
    return $remove(type, id);
  };

  const publish = function({ body: obj, params: { type } }) {
    assert(includes($objectTypes, type), `${type} not supported!`);

    return $save(type, obj).then(() => {
      return $publish(type, obj).then(() => {
        if (!publishCallBack) return obj;

        return publishCallBack(obj).then(() => obj);
      });
    });
  };

  return { list, get, post, del, publish };
};
