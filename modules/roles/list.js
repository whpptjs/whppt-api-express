module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, ['root'], true);
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
