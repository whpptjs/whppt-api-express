const assert = require('assert');

const { publishCallBack } = require(`${process.cwd()}/whppt.config.js`);

module.exports = context => {
  const {
    $mongo: { $db, $publish, $fetch, $list, $save, $delete, $remove },
    $id,
  } = context;

  const list = function({ params: { type }, query: { showRemoved = false } }) {
    return $list(type, showRemoved);
  };

  const checkSlug = function({ params: { type }, query: { slug, id } }) {
    assert(slug, 'Slug is required');
    if (slug.startsWith('/')) slug.replace('/^(/)/', '');

    return $db
      .collection(type)
      .findOne({ slug, _id: { $ne: id } })
      .then(event => event && event._id);
  };

  const get = function({ params: { type, id, slug } }) {
    console.log('slug', slug);
    if (slug) return $fetch(type, slug);

    assert(id, 'Id is required');
    return $fetch(type, id);
  };

  const post = function({ body: obj, params: { type } }) {
    console.log(obj);
    obj._id = obj._id || $id();
    return $save(type, obj).then(() => {
      return $fetch(type, obj._id).then(newObj => newObj);
    });
  };

  const del = function({ params: { type, id }, query: { force } }) {
    if (force) return $delete(type, id);
    return $remove(type, id);
  };

  const publish = function({ body: obj, params: { type } }) {
    return $save(type, obj).then(() => {
      return $publish(type, obj).then(() => {
        if (!publishCallBack) return obj;

        return publishCallBack(obj).then(() => obj);
      });
    });
  };

  return { list, checkSlug, get, post, del, publish };
};
