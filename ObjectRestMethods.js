const includes = require('lodash/includes');
const assert = require('assert');

module.exports = context => {
  const { $security, $objectTypes, $mongo, $id } = context;

  const list = function({ params: { type }, query: { showRemoved } = {} }) {
    assert(includes($objectTypes, type), `${type} not supported!`);
    return $mongo.$db.$list(type, showRemoved);
  };

  const get = function({ params: { type, id } }) {
    assert(includes($objectTypes, type), `${type} not supported!`);
    assert(id, 'Id is required');
    return $mongo.$db.$fetch(type, id);
  };

  const post = function({ body: obj, params: { type } }) {
    assert(includes($objectTypes, type), `${type} not supported!`);
    obj.id = obj.id || $id();
    return $mongo.$save(type, obj);
  };

  const del = function({ params: { type, id }, query: { force } }) {
    assert(includes($objectTypes, type), `${type} not supported!`);

    if (force) return $delete(type, id);
    return $remove(type, id);
  };

  return { list, get, post, del };
};
