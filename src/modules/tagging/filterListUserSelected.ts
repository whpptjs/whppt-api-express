import keyBy from 'lodash/keyBy';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

export type FilterListUserSelected = {
  domainId: string;
  tagFilters: {
    selected: any[];
    include: any[];
    userIncluded: [];
    exclude: any[];
    ignoreSort: boolean;
    ignoreLimit: boolean;
    limit: number;
    currentPage: number;
    sort: any;
  };
};

const filterListUserSelected: HttpModule<FilterListUserSelected, any> = {
  exec({ $database }, { domainId, tagFilters }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {} as any;
      if (domainId && domainId !== 'undefined') query.domainId = domainId;

      if (tagFilters && !tagFilters.selected.length) {
        if (tagFilters.userIncluded.length || tagFilters.include.length)
          query.tags = {
            $in: tagFilters.userIncluded.length
              ? tagFilters.userIncluded
              : tagFilters.include,
          };

        if (tagFilters.exclude.length)
          query.tags = { ...(query.tags || {}), $nin: tagFilters.exclude };
      }

      if (tagFilters && tagFilters.selected.length) {
        query._id = { $in: tagFilters.selected };
      }
      let promise = db.collection('pages').find(query);

      if (!tagFilters.ignoreLimit) {
        promise.limit(Number(tagFilters.limit) || 8);
        promise.skip(tagFilters.limit * tagFilters.currentPage);
      }

      if (!tagFilters.ignoreSort) promise = sortLookup(promise, tagFilters.sort);

      return Promise.all([
        promise.toArray().then(items => {
          if (!tagFilters.ignoreSort) return items;

          const _keyedItems = keyBy(items, '_id');
          return tagFilters.selected.map(s => {
            return _keyedItems[s];
          });
        }),
        db.collection('pages').countDocuments(query),
      ]).then(([items, total]) => ({ items, total }));
    });
  },
};

export default filterListUserSelected;

const sortLookup = (promise: any, key: { sortType: string; fields: any }) => {
  const _key = {
    sortType: key && key.sortType ? key.sortType : 'name (a-z)',
    fields: key && key.fields ? key.fields : { 'header.title': -1 },
  };

  switch (_key.sortType) {
    case 'string':
      return promise.collation({ locale: 'en' }).sort(_key.fields);

    default:
      return promise.sort(_key.fields);
  }
};
