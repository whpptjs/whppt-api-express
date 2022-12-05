import keyBy from 'lodash/keyBy';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

export type FilterListSelected = {
  domainId: string;
  tagFilters: {
    selected: any[];
    include: any[];
    exclude: any[];
    ignoreSort: boolean;
    ignoreLimit: boolean;
    limit: number;
    sort: any;
  };
};

const filterListSelected: HttpModule<FilterListSelected, any> = {
  exec({ $database }, { domainId, tagFilters }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {} as any;
      if (domainId && domainId !== 'undefined') query.domainId = domainId;

      if (tagFilters && !tagFilters.selected.length) {
        if (tagFilters.include.length) query.tags = { $in: tagFilters.include };

        if (tagFilters.exclude.length)
          query.tags = { ...(query.tags || {}), $nin: tagFilters.exclude };
      }

      if (tagFilters && tagFilters.selected.length) {
        query._id = { $in: tagFilters.selected };
      }
      let promise = db.collection('pages').find(query);

      if (!tagFilters.ignoreLimit) promise.limit(Number(tagFilters.limit) || 8);

      if (!tagFilters.ignoreSort) promise = sortLookup(promise, tagFilters.sort);

      return promise.toArray().then(items => {
        if (!tagFilters.ignoreSort) return items;

        const _keyedItems = keyBy(items, '_id');
        return tagFilters.selected.map(s => {
          return _keyedItems[s];
        });
      });
    });
  },
};

export default filterListSelected;

const sortLookup = (promise: any, key: { sortType: string; fields: any }) => {
  key.sortType = key.sortType || 'name (a-z)';
  switch (key.sortType) {
    case 'string':
      return promise.collation({ locale: 'en' }).sort(key.fields);

    default:
      return promise.sort(key.fields);
  }
};
