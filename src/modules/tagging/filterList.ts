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
  queryInput?: string;
};

const filterList: HttpModule<FilterList, any> = {
  exec(
    { $database },
    { domainId, tagFilters, headerFilter, pageIndex = 0, size = 20, queryInput }
  ) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = {
        $or: queryInput
          ? [
              { 'header.content.heading': { $regex: queryInput, $options: 'i' } },
              { 'header.content.title': { $regex: queryInput, $options: 'i' } },
            ]
          : [
              { 'header.content.heading': { $exists: true, $ne: '' } },
              { 'header.content.title': { $exists: true, $ne: '' } },
            ],
      } as any;

      if (domainId && domainId !== 'undefined') query.domainId = domainId;

      if (tagFilters) {
        if (tagFilters.include.length)
          query.tags = { ...(query.tags || {}), $all: tagFilters.include };

        if (tagFilters.exclude.length)
          query.tags = { ...(query.tags || {}), $nin: tagFilters.exclude };
      }

      if (headerFilter) {
        query.$or.map((o: any) => {
          return {
            ...o,
            $regex: headerFilter,
            $options: 'i',
          };
        });
      }

      const _size = Number(size);
      const _pageIndex = Number(pageIndex);
      return db
        .collection('pages')
        .find(query)
        .sort({ 'header.heading': 1 })
        .skip(_pageIndex * _size)
        .limit(_size)
        .toArray();
    });
  },
};

export default filterList;
