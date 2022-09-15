const save = require('./save');

module.exports = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, [], true);
  },
  exec(context) {
    const {
      whpptOptions: { pageTypes },
      $mongo: { $db },
    } = context;

    const collections = pageTypes.map(pt =>
      pt.collection ? pt.collection.name : pt.key || pt.name
    );
    const pageQueries = collections.map(collection =>
      $db.collection(collection).find().toArray()
    );

    return Promise.all(pageQueries).then(collectionPages => {
      const saveQueries = [];

      collectionPages.forEach(pages => {
        pages.forEach(page => {
          const pageType = pageTypes.find(pt => (pt.key || pt.name) === page.pageType);
          const pageCollection = pageType.collection
            ? pageType.collection.name
            : pageType.key || pageType.name;

          saveQueries.push(save.exec(context, { page, collection: pageCollection }));
        });
      });

      return Promise.all(saveQueries).then(
        () => `${saveQueries.length} page(s) reindexed`
      );
    });
  },
};

// startsWith query
// { "type": "link", "href": { $regex : "https://draft.live.uc.svelteteam.com", $options: "i" } }
