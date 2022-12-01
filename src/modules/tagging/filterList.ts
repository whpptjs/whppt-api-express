import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

export type FilterList = {
  domainId: string;
  size: number;
  pageIndex: number;
  headerFilter: any;
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

const filterList: HttpModule<FilterList, any> = {
  exec({ $database }, { domainId, tagFilters, headerFilter, pageIndex = 0, size = 20 }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      const query = {
        'header.heading': { $exists: true, $ne: '' },
      } as any;
      if (domainId && domainId !== 'undefined') query.domainId = domainId;

      if (tagFilters) {
        if (tagFilters.include.length)
          query.tags = { ...(query.tags || {}), $all: tagFilters.include };

        if (tagFilters.exclude.length)
          query.tags = { ...(query.tags || {}), $nin: tagFilters.exclude };
      }

      if (headerFilter) {
        query['header.heading'].$regex = headerFilter;
        query['header.heading'].$options = 'i';
      }
      return db
        .collection('pages')
        .find(query)
        .sort({ 'header.heading': 1 })
        .skip(pageIndex * size)
        .limit(size)
        .toArray();
    });
  },
};

export default filterList;
