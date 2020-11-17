module.exports = {
  authorise({ $roles }, { user }) {
    // TODO: update to allow other roles besides root
    return $roles.validate(user, ['root']);
  },
  exec({ $mongo: { $db } }, { page = 1, perPage = 100 }) {
    const query = $db.collection('roles').find({});

    return query.count().then(total => {
      return query
        .limit(+perPage)
        .skip((page - 1) * perPage)
        .toArray()
        .then(roles => {
          return { roles, total };
        });
    });
  },
};
